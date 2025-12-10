#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const JavaAnalyzer = require('./analyzers/javaAnalyzer');
const ReactAnalyzer = require('./analyzers/reactAnalyzer');

// Get environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = parseInt(process.env.PR_NUMBER, 10);
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

if (!GITHUB_TOKEN || !PR_NUMBER || !REPO_OWNER || !REPO_NAME) {
  console.error('Missing required environment variables');
  console.error({
    GITHUB_TOKEN: !!GITHUB_TOKEN,
    PR_NUMBER,
    REPO_OWNER,
    REPO_NAME
  });
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function main() {
  try {
    console.log(`\n Starting PR Review for #$${PR_NUMBER}\n`);

    // Get changed files
    const { data: files } = await octokit.pulls.listFiles({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: PR_NUMBER
    });

    console.log(` Files changed: $${files.length}\n`);

    let allIssues = [];
    let analyzedCount = 0;

    // Analyze each file
    for (const file of files) {
      const filename = file.filename;
      console.log(`   Analyzing: $${filename}`);

      try {
        // Read file from disk (it'"'"'s already checked out)
        if (!fs.existsSync(filename)) {
          console.log(`      File not found on disk (might be deleted)`);
          continue;
        }

        const fileContent = fs.readFileSync(filename, 'utf-8');
        
        if (filename.endsWith('.java')) {
          const result = JavaAnalyzer.analyze(fileContent, filename);
          if (result.issues && result.issues.length > 0) {
            allIssues.push(...result.issues);
            console.log(`     Found $${result.issues.length} issues`);
            analyzedCount++;
          }
        } else if (filename.match(/\.(jsx?|tsx?)$/)) {
          const result = ReactAnalyzer.analyze(fileContent, filename);
          if (result.issues && result.issues.length > 0) {
            allIssues.push(...result.issues);
            console.log(`     Found $${result.issues.length} issues`);
            analyzedCount++;
          }
        }
      } catch (err) {
        console.error(`     Error analyzing $${filename}:`, err.message);
      }
    }

    console.log(`\n Analyzed $${analyzedCount} files, found $${allIssues.length} issues\n`);

    // Create summary comment
    const summary = createSummary(allIssues, files);

    try {
      await octokit.issues.createComment({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: PR_NUMBER,
        body: summary
      });
      console.log(' Posted review summary comment\n');
    } catch (err) {
      console.error(' Failed to post comment:', err.message);
    }

  } catch (err) {
    console.error(' Error:', err.message);
    process.exit(1);
  }
}

function createSummary(issues, files) {
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos = issues.filter(i => i.severity === 'info').length;
  const total = issues.length;

  let summary = `##  Automated Code Review\n\n`;
  summary += `**Files Analyzed:** $${files.length}\n\n`;

  summary += `### Review Summary\n`;
  summary += `| Severity | Count |\n`;
  summary += `|----------|-------|\n`;
  summary += `|  Errors | $${errors} |\n`;
  summary += `|  Warnings | $${warnings} |\n`;
  summary += `| ? Info | $${infos} |\n`;
  summary += `| **Total** | **$${total}** |\n\n`;

  if (total === 0) {
    summary += ` **Great job!** No issues found in your code.\n`;
  } else if (errors === 0) {
    summary += ` **No critical errors!** Please review the warnings and suggestions below.\n`;
  } else {
    summary += ` **Please fix the $${errors} error(s) before merging.**\n`;
  }

  if (total > 0) {
    summary += `\n### Issues Found\n\n`;
    const byFile = {};
    issues.forEach(issue => {
      if (!byFile[issue.file]) byFile[issue.file] = [];
      byFile[issue.file].push(issue);
    });

    for (const [file, fileIssues] of Object.entries(byFile)) {
      const fileErrors = fileIssues.filter(i => i.severity === 'error').length;
      const fileWarnings = fileIssues.filter(i => i.severity === 'warning').length;
      summary += `\n**$${file}** ($${fileErrors} errors, $${fileWarnings} warnings)\n`;

      fileIssues.slice(0, 5).forEach(issue => {
        const emoji = { '"'"'error'"'"': '', '"'"'warning'"'"': '', '"'"'info'"'"': '?' }[issue.severity] || '';
        summary += `- $${emoji} $${issue.rule}: $${issue.message}\n`;
        if (issue.suggestion) {
          summary += `   $${issue.suggestion}\n`;
        }
      });

      if (fileIssues.length > 5) {
        summary += `- ... and $${fileIssues.length - 5} more\n`;
      }
    }
  }

  summary += `\n---\n`;
  summary += ` [View PR Review Agent](https://github.com/bsimulator/pr-review-agent)\n`;

  return summary;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
