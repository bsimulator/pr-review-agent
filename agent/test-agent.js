/**
 * Test Agent Script
 * Demonstrates how to use the PR Review Agent locally
 */

const PRReviewAgent = require('./src/index.js');

// Sample Java file
const javaFile = {
  filename: 'src/Main.java',
  content: `
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");  // Use logging framework!
    
    try {
      int result = 10 / 2;
    } catch (Exception e) {
      // Empty catch block - bad!
    }
  }
}
`
};

// Sample React file
const reactFile = {
  filename: 'src/App.jsx',
  content: `
import React, { useState } from 'react';

function App() {
  var name = "John";  // Use const/let!
  
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Hello {name}</h1>
      <button onClick={() => console.log("clicked")}>
        Count: {count}
      </button>
      
      {[1, 2, 3].map(item => (
        <div>{item}</div>  // Missing key prop!
      ))}
    </div>
  );
}

export default App;
`
};

// Create and run agent
console.log('🚀 Starting PR Review Agent Test...\n');

const agent = new PRReviewAgent({
  type: 'cli',
  verbose: true
});

async function runTest() {
  try {
    const files = [javaFile, reactFile];
    
    console.log('📄 Files to review:');
    files.forEach(f => console.log(`   - ${f.filename}`));
    console.log('\n');
    
    // Review files
    const results = await agent.review(files);
    
    // Display results
    console.log('\n✅ Review Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Total issues: ${results.summary.total}`);
    console.log(`   Errors: ${results.summary.errors}`);
    console.log(`   Warnings: ${results.summary.warnings}`);
    console.log(`   Info: ${results.summary.info}\n`);
    
    if (results.issues.length > 0) {
      console.log('📋 Issues Found:\n');
      results.issues.forEach((issue, idx) => {
        const emoji = {
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️'
        }[issue.severity] || '💬';
        
        console.log(`${idx + 1}. ${emoji} ${issue.file}:${issue.line}`);
        console.log(`   Rule: ${issue.rule}`);
        console.log(`   Message: ${issue.message}`);
        console.log(`   Suggestion: ${issue.suggestion}\n`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run the test
runTest().then(results => {
  console.log('✨ Test completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('Error running test:', error);
  process.exit(1);
});
