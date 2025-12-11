#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const JavaAnalyzer = require('./analyzers/java-analyzer');
const ReactAnalyzer = require('./analyzers/react-analyzer');

// Environment config - tokens are no longer required
const BASE_REF = process.env.GITHUB_BASE_REF || 'main';
const HEAD_REF = process.env.GITHUB_HEAD_REF || 'HEAD';

function main() {
  try {
    console.log('\n🤖 PR Review Agent - Code Analysis\n');

    // Get changed files
    const files = getChangedFiles();
    if (files.length === 0) {
      console.log('✅ No files to analyze\n');
      return;
    }

    // Analyze
    const issues = analyzeFiles(files);
    console.log(`\n✅ Found ${issues.length} issues\n`);

    // Display results
    if (issues.length > 0) {
      displayIssues(issues);
    } else {
      console.log('✨ No issues found - code looks good!\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function getChangedFiles() {
  try {
    // Fetch base branch
    try {
      execSync(`git fetch origin ${BASE_REF}:${BASE_REF}`, {
        stdio: 'pipe'
      });
    } catch (e) {}

    // Get diff
    const output = execSync(`git diff --name-only ${BASE_REF}...${HEAD_REF}`, {
      encoding: 'utf-8'
    });

    return output
      .split('\n')
      .filter(f => f.trim())
      .filter(f => f.match(/\.(java|jsx?|tsx?)$/))
      .filter(f => !f.includes('agent/') && !f.includes('src/analyzers/') && !f.startsWith('src/'));
  } catch {
    return [];
  }
}

function analyzeFiles(files) {
  const javaAnalyzer = new JavaAnalyzer();
  const reactAnalyzer = new ReactAnalyzer();
  const issues = [];

  for (const file of files) {
    console.log(`📄 ${file}`);
    try {
      const content = fs.readFileSync(file, 'utf-8');
      let fileIssues = [];

      if (file.endsWith('.java')) {
        fileIssues = javaAnalyzer.analyze(content, file);
      } else if (file.match(/\.(jsx?|tsx?)$/)) {
        fileIssues = reactAnalyzer.analyze(content, file);
      }

      if (fileIssues.length > 0) {
        console.log(`   ✓ ${fileIssues.length} issues`);
        issues.push(...fileIssues);
      }
    } catch (e) {
      console.log(`   ⚠️  ${e.message}`);
    }
  }

  return issues;
}

function displayIssues(issues) {
  const byFile = {};
  for (const issue of issues) {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  }

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`\n${file}:`);
    for (const issue of fileIssues) {
      console.log(`  Line ${issue.line} [${issue.severity}] ${issue.rule}`);
      console.log(`    ${issue.message}`);
      if (issue.suggestion) {
        console.log(`    💡 ${issue.suggestion}`);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

