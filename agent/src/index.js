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
    const { execSync } = require('child_process');
    let files = [];

    try {
      // Get list of changed files between base and head
      const output = execSync(`git diff --name-only origin/${BASE_REF}...HEAD`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      files = output
        .split('\n')
        .filter(f => f.trim())
        .filter(f => f.match(/\.(java|jsx?|tsx?)$/))
        .filter(f => {
          // Explicitly exclude all agent infrastructure files
          if (f.includes('agent/')) return false;
          if (f.includes('src/')) return false;
          if (f.includes('analyzer')) return false;
          if (f.includes('service')) return false;
          if (f.includes('utils')) return false;
          return true;
        })
        .map(filename => ({ filename }));
        
      if (files.length > 0) {
        return files;
      }
    } catch (err) {
      console.log('⚠️  Could not get changed files from git');
    }

    // Fallback: analyze all relevant files in repo (excluding agent)
    try {
      const javaFiles = execSync(`find . -name "*.java" -type f 2>/dev/null || true`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      })
        .split('\n')
        .filter(f => f.trim())
        .filter(f => !f.includes('agent/') && !f.includes('src/'));
        
      const jsFiles = execSync(`find . \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \\) -type f 2>/dev/null || true`, { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      })
        .split('\n')
        .filter(f => f.trim())
        .filter(f => !f.includes('agent/') && !f.includes('src/'));
        
      files = [...javaFiles, ...jsFiles].map(filename => ({ filename }));
    } catch (err) {
      // Silent catch
    }

    return files;
  } catch {
    return [];
  }
}

function analyzeFiles(files) {
  const javaAnalyzer = require('./analyzers/javaAnalyzer');  // Already an instance
  const ReactAnalyzerClass = require('./analyzers/reactAnalyzer');
  const reactAnalyzer = new ReactAnalyzerClass();
  const issues = [];

  for (const file of files) {
    console.log(`📄 ${file.filename}`);
    try {
      const content = fs.readFileSync(file.filename, 'utf-8');
      let fileIssues = [];

      if (file.filename.endsWith('.java')) {
        fileIssues = javaAnalyzer.analyze(content, file.filename);
      } else if (file.filename.match(/\.(jsx?|tsx?)$/)) {
        fileIssues = reactAnalyzer.analyze(content, file.filename);
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

