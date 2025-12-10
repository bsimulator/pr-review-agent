#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

async function initAndRun() {
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  await main(octokit);
}

async function main(octokit) {
  try {
    console.log(`\n🤖 Starting PR Review for #${PR_NUMBER}\n`);

    // Get changed files using git
    const { execSync } = require('child_process');
    let files = [];
    
    try {
      // Get list of changed files between base and head
      const output = execSync(`git diff --name-only origin/main...HEAD`, { encoding: 'utf-8' });
      files = output.split('\n').filter(f => f.trim()).map(filename => ({ filename }));
    } catch (err) {
      console.log('⚠️  Could not get changed files from git, analyzing current directory...');
      // Fallback: analyze all relevant files in the repo
      const javaFiles = execSync(`find . -name "*.java" -type f 2>/dev/null || true`, { encoding: 'utf-8' }).split('\n').filter(f => f.trim());
      const jsFiles = execSync(`find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`, { encoding: 'utf-8' }).split('\n').filter(f => f.trim());
      files = [...javaFiles, ...jsFiles].map(filename => ({ filename }));
    }

    console.log(`📁 Files to analyze: ${files.length}\n`);

    let allIssues = [];
    let analyzedCount = 0;

    // Analyze each file
    for (const file of files) {
      const filename = file.filename;
      console.log(`   Analyzing: ${filename}`);

      try {
        // Read file from disk (it's already checked out)
        if (!fs.existsSync(filename)) {
          console.log(`      File not found on disk (might be deleted)`);
          continue;
        }

        const fileContent = fs.readFileSync(filename, 'utf-8');
        
        if (filename.endsWith('.java')) {
          const result = JavaAnalyzer.analyze(fileContent, filename);
          if (result.issues && result.issues.length > 0) {
            allIssues.push(...result.issues);
            console.log(`     Found ${result.issues.length} issues`);
            analyzedCount++;
          }
        } else if (filename.match(/\.(jsx?|tsx?)$/)) {
          const result = ReactAnalyzer.analyze(fileContent, filename);
          if (result.issues && result.issues.length > 0) {
            allIssues.push(...result.issues);
            console.log(`     Found ${result.issues.length} issues`);
            analyzedCount++;
          }
        }
      } catch (err) {
        console.error(`     Error analyzing ${filename}:`, err.message);
      }
    }

    console.log(`\n Analyzed ${analyzedCount} files, found ${allIssues.length} issues\n`);

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

  let summary = `## 🤖 Automated Code Review\n\n`;
  summary += `**Files Analyzed:** ${files.length}\n\n`;

  summary += `### Review Summary\n`;
  summary += `| Severity | Count |\n`;
  summary += `|----------|-------|\n`;
  summary += `| ❌ Errors | ${errors} |\n`;
  summary += `| ⚠️ Warnings | ${warnings} |\n`;
  summary += `| ℹ️ Info | ${infos} |\n`;
  summary += `| **Total** | **${total}** |\n\n`;

  if (total === 0) {
    summary += ` **Great job!** No issues found in your code.\n`;
  } else if (errors === 0) {
    summary += ` **No critical errors!** Please review the warnings and suggestions below.\n`;
  } else {
    summary += ` **Please fix the ${errors} error(s) before merging.**\n`;
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
      summary += `\n**${file}** (${fileErrors} errors, ${fileWarnings} warnings)\n`;

      fileIssues.slice(0, 5).forEach(issue => {
        const emoji = { 'error': '❌', 'warning': '⚠️', 'info': 'ℹ️' }[issue.severity] || '📝';
        summary += `- ${emoji} ${issue.rule}: ${issue.message}\n`;
        if (issue.suggestion) {
          summary += `  💡 ${issue.suggestion}\n`;
        }
      });

      if (fileIssues.length > 5) {
        summary += `- ... and ${fileIssues.length - 5} more\n`;
      }
    }
  }

  summary += `\n---\n`;
  summary += `📖 [View PR Review Agent](https://github.com/bsimulator/pr-review-agent)\n`;

  return summary;
}

initAndRun().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

