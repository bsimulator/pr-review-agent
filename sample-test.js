#!/usr/bin/env node

/**
 * Sample test file to verify the PR Review Agent works correctly
 * This creates test Java and React files, then runs the agent to analyze them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create test directories
const testDir = './test-samples';
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Sample Java file with violations
const javaTestFile = path.join(testDir, 'TestViolations.java');
const javaContent = `public class TestViolations {
  public void badCode() {
    System.out.println("Debug output"); // Should be flagged
    
    try {
      int x = 1 / 0;
    } catch (Exception e) {
      // Empty catch block - should be flagged
    }
    
    String dbUrl = "jdbc:mysql://localhost:3306/mydb"; // Hardcoded DB URL
    
    // TODO incomplete comment
    String query = "SELECT * FROM users WHERE id = " + userId; // SQL injection risk
  }
  
  private void resourceLeak() {
    FileReader reader = new FileReader("file.txt"); // Missing try-with-resources
  }
}`;

// Sample React file with violations
const reactTestFile = path.join(testDir, 'TestComponent.jsx');
const reactContent = `import React, { useState } from 'react';

export function BadComponent() {
  // useState in conditional - should be flagged
  if (true) {
    const [state, setState] = useState(0);
  }
  
  // Missing dependency array - should be flagged
  React.useEffect(() => {
    console.log("This effect has no dependencies");
  });
  
  const items = ['a', 'b', 'c'];
  
  // Missing keys in list - should be flagged
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li> // Index as key - anti-pattern
      ))}
    </ul>
  );
}`;

// Write test files
console.log('📝 Creating test files...');
fs.writeFileSync(javaTestFile, javaContent);
fs.writeFileSync(reactTestFile, reactContent);
console.log(`✅ Created ${javaTestFile}`);
console.log(`✅ Created ${reactTestFile}`);

// Run the agent on test files
console.log('\n🤖 Running PR Review Agent on test files...\n');

try {
  // Set environment variables for the test
  process.env.GITHUB_BASE_REF = 'main';
  process.env.GITHUB_HEAD_REF = 'HEAD';
  // Don't set GITHUB_TOKEN so it just outputs to console
  
  // Run the agent
  const javaAnalyzer = require('./agent/src/analyzers/javaAnalyzer');
  const ReactAnalyzerClass = require('./agent/src/analyzers/reactAnalyzer');
  const reactAnalyzer = new ReactAnalyzerClass();
  
  console.log('📄 Analyzing Java file...');
  const javaIssues = javaAnalyzer.analyze(javaContent, javaTestFile);
  console.log(`Found ${javaIssues.length} issues in Java file:\n`);
  javaIssues.forEach(issue => {
    console.log(`  Line ${issue.line} [${issue.severity}] ${issue.rule}`);
    console.log(`    ${issue.message}`);
    if (issue.suggestion) {
      console.log(`    💡 ${issue.suggestion}`);
    }
  });
  
  console.log('\n📄 Analyzing React file...');
  const reactIssues = reactAnalyzer.analyze(reactContent, reactTestFile);
  console.log(`Found ${reactIssues.length} issues in React file:\n`);
  reactIssues.forEach(issue => {
    console.log(`  Line ${issue.line} [${issue.severity}] ${issue.rule}`);
    console.log(`    ${issue.message}`);
    if (issue.suggestion) {
      console.log(`    💡 ${issue.suggestion}`);
    }
  });
  
  console.log('\n✅ Test complete!');
  console.log(`\nSummary:`);
  console.log(`  Java violations: ${javaIssues.length}`);
  console.log(`  React violations: ${reactIssues.length}`);
  console.log(`  Total violations: ${javaIssues.length + reactIssues.length}`);
  
} catch (error) {
  console.error('❌ Error running test:', error.message);
  process.exit(1);
}

// Cleanup
console.log('\n🧹 Cleaning up test files...');
fs.rmSync(testDir, { recursive: true, force: true });
console.log('✅ Cleanup complete');
