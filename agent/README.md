# 📦 PR Review Agent - Reusable Package

The **PR Review Agent** is now a completely standalone, reusable package that anyone can use in their own projects!

## 🎯 What is This?

A modular, npm-installable code review agent that:
- ✅ Works in any repository
- ✅ No setup required (just install and use)
- ✅ Extensible with custom analyzers
- ✅ Works in GitHub Actions, CLI, or custom integrations
- ✅ Zero dependencies (except Octokit for GitHub)

## 📥 Installation Options

### Option 1: From GitHub (Recommended)
```bash
npm install @pr-review/agent
# Or with yarn
yarn add @pr-review/agent
```

### Option 2: Local Development
```bash
cd agent
npm install
npm link
```

## 🚀 Quick Start

### In GitHub Actions

Update `.github/workflows/pr-review.yml`:
```yaml
name: PR Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run PR Review
        run: |
          npm install
          node -e "
            const Agent = require('./agent');
            const agent = new Agent({ type: 'github-actions' });
            // Review logic here
          "
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### In Node.js Code

```javascript
const PRReviewAgent = require('@pr-review/agent');

// Create agent
const agent = new PRReviewAgent({
  type: 'custom',
  verbose: true
});

// Review files
const files = [
  { filename: 'src/Main.java', patch: '...' },
  { filename: 'src/App.jsx', patch: '...' }
];

const results = await agent.review(files);
console.log(results);

// Output:
// {
//   success: true,
//   timestamp: '2025-12-10T...',
//   filesReviewed: 2,
//   totalIssues: 5,
//   issues: [...],
//   byFile: {...},
//   summary: { total: 5, errors: 2, warnings: 3, info: 0, ... }
// }
```

### In CLI

```bash
npm install @pr-review/agent

# Review changed files in current branch
npx pr-review-agent --changed-files

# Review specific file
npx pr-review-agent --file src/Main.java

# With local server (optional)
npx pr-review-agent --server 3000
```

## 📋 API Reference

### PRReviewAgent Constructor

```javascript
new PRReviewAgent(config)
```

**Config Options:**
- `type` (string): `'github-actions'`, `'cli'`, or `'custom'` - default: `'github-actions'`
- `token` (string): GitHub token - default: `process.env.GITHUB_TOKEN`
- `analyzers` (object): Custom analyzer instances
- `verbose` (boolean): Enable verbose logging - default: `false`

### agent.review(changedFiles)

Review an array of changed files.

**Input:**
```javascript
[
  {
    filename: 'src/Main.java',
    patch: '+  System.out.println("test");',
    content: 'public class Main { ... }'
  },
  // ... more files
]
```

**Output:**
```javascript
{
  success: boolean,
  timestamp: string,
  filesReviewed: number,
  totalIssues: number,
  issues: [
    {
      file: string,
      line: number,
      severity: 'error' | 'warning' | 'info',
      rule: string,
      message: string,
      suggestion: string
    },
    // ... more issues
  ],
  byFile: {
    'src/Main.java': [ /* issues */ ],
    'src/App.jsx': [ /* issues */ ]
  },
  summary: {
    total: number,
    errors: number,
    warnings: number,
    info: number,
    fileCount: number,
    filesWithIssues: number
  }
}
```

### agent.postComments(owner, repo, prNumber, results)

Post comments to GitHub PR (requires GitHub token).

```javascript
await agent.postComments('myorg', 'myrepo', 42, reviewResults);
```

### agent.addAnalyzer(fileType, analyzer)

Add custom analyzer for additional languages.

```javascript
class PythonAnalyzer {
  analyze(content, filename) {
    return [
      {
        file: filename,
        line: 1,
        severity: 'warning',
        rule: 'RULE_ID',
        message: 'Issue message',
        suggestion: 'How to fix'
      }
    ];
  }
}

agent.addAnalyzer('python', new PythonAnalyzer());
```

## 🔧 Creating Custom Analyzers

Create a file `src/analyzers/pythonAnalyzer.js`:

```javascript
class PythonAnalyzer {
  /**
   * Analyze Python file content
   * @param {string} content - File content
   * @param {string} filename - File path
   * @returns {Array} Array of issue objects
   */
  analyze(content, filename) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for print statements (should use logging)
      if (line.includes('print(') && !line.trim().startsWith('#')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'USE_LOGGING',
          message: 'Use logging framework instead of print()',
          suggestion: 'Replace with logging.info()'
        });
      }

      // Check for hardcoded credentials
      if (/(password|secret|api_key)\s*=\s*["']/.test(line)) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'HARDCODED_SECRET',
          message: 'Hardcoded secret detected',
          suggestion: 'Use environment variables'
        });
      }
    });

    return issues;
  }
}

module.exports = PythonAnalyzer;
```

Use it:
```javascript
const PythonAnalyzer = require('./src/analyzers/pythonAnalyzer');

agent.addAnalyzer('python', new PythonAnalyzer());
```

## 📂 Directory Structure

```
agent/
├── package.json                 # Dependencies
├── README.md                    # This file
├── src/
│   ├── index.js                # Main agent class
│   ├── analyzers/
│   │   ├── javaAnalyzer.js     # Java rules
│   │   └── reactAnalyzer.js    # React/JS/TS rules
│   ├── services/
│   │   ├── githubService.js    # GitHub API integration
│   │   └── commentFormatter.js # Format comments
│   └── utils/
│       └── logger.js           # Logging utility
├── examples/
│   ├── github-actions.js       # GitHub Actions example
│   ├── custom-analyzer.js      # Custom analyzer example
│   └── local-testing.js        # Local testing example
└── tests/
    ├── javaAnalyzer.test.js
    └── reactAnalyzer.test.js
```

## 🔐 Configuration

### GitHub Token
```javascript
// Automatic (in GitHub Actions)
const agent = new PRReviewAgent({ type: 'github-actions' });

// Manual
const agent = new PRReviewAgent({
  token: 'ghp_xxxxxxxxxxxx'
});

// Via environment variable
process.env.GITHUB_TOKEN = 'ghp_xxxxxxxxxxxx';
const agent = new PRReviewAgent();
```

### Custom Rules
Create `rules.json`:
```json
{
  "java": {
    "enabled": ["USE_LOGGING", "EMPTY_CATCH", "MAGIC_NUMBER"],
    "severity": {
      "HARDCODED_SECRET": "error",
      "CONSOLE_LOG": "warning"
    }
  }
}
```

## 📊 Built-in Analyzers

### Java Analyzer
Detects:
- ❌ Hardcoded secrets/passwords
- ⚠️ System.out.println (use logging)
- ❌ Empty catch blocks
- ⚠️ Magic numbers
- ⚠️ Wildcard imports
- ⚠️ Long lines
- ℹ️ TODO comments without description
- And more...

### React Analyzer
Detects:
- ⚠️ console.log statements
- ❌ Missing key prop in lists
- ❌ Direct state mutation
- ❌ Missing imports
- ⚠️ Inline function definitions
- ⚠️ var usage (should use const/let)
- ℹ️ useEffect with empty dependencies
- ⚠️ Promise chains without error handling
- And more...

## 🚀 Usage Examples

### Example 1: Simple File Review

```javascript
const Agent = require('@pr-review/agent');

const agent = new Agent();
const files = [
  {
    filename: 'src/Main.java',
    content: `
      public class Main {
        public static void main(String[] args) {
          System.out.println("Hello"); // Issue!
        }
      }
    `
  }
];

const results = await agent.review(files);
console.log(JSON.stringify(results, null, 2));
```

### Example 2: GitHub Actions Integration

```javascript
// .github/workflows/pr-review.yml
const github = require('@actions/github');
const Agent = require('@pr-review/agent');

async function run() {
  const context = github.context;
  const client = github.getOctokit(process.env.GITHUB_TOKEN);
  
  // Get PR files
  const { data: files } = await client.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  });
  
  // Review them
  const agent = new Agent({ type: 'github-actions' });
  const results = await agent.review(files);
  
  // Post comments
  await agent.postComments(
    context.repo.owner,
    context.repo.repo,
    context.issue.number,
    results
  );
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
```

### Example 3: Custom Analyzer

```javascript
class GoAnalyzer {
  analyze(content, filename) {
    // Custom Go linting rules
    return [];
  }
}

const agent = new Agent();
agent.addAnalyzer('go', new GoAnalyzer());

// Now it analyzes .go files too!
```

## 🧪 Testing

```bash
cd agent
npm install
npm test

# With coverage
npm run test:coverage
```

## 📝 Publishing to npm

```bash
# Update version in package.json
npm version patch

# Build and test
npm test

# Publish
npm publish --access public
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/my-analyzer`
3. Add tests
4. Submit PR

## 📄 License

MIT - Use freely in your projects!

## 🔗 Links

- 📚 [Full Documentation](./docs)
- 🐛 [Report Issues](https://github.com/yourusername/pr-review-agent/issues)
- 💬 [Discussions](https://github.com/yourusername/pr-review-agent/discussions)
- 📖 [Examples](./examples)

---

**Ready to review code automatically? Install @pr-review/agent today!** ✨
