# PR Review Agent

A reusable, token-free code review agent for Java and React projects.

## 🚀 Quick Start

```bash
npm install
cd agent
npm install
```

## 📦 What's Inside

- **`/agent`** - Standalone npm package for PR reviews
  - `src/` - Implementation (analyzers, services, utils)
  - `package.json` - npm configuration
  - `README.md` - Complete API documentation

- **`/.github/workflows`** - GitHub Actions integration
  - Auto-reviews on every PR

## 📖 Documentation

- **`QUICK_START_AGENT_SEPARATION.md`** - 5-minute overview
- **`GIT_STRATEGY.md`** - Git workflow and branching
- **`AGENT_PACKAGE_OVERVIEW.md`** - What's included
- **`agent/README.md`** - Full API reference

## ✨ Features

✅ Java code analyzer (12+ rules)
✅ React/JS/TS analyzer (12+ rules)
✅ GitHub Actions integration
✅ Extensible with custom analyzers
✅ Zero configuration needed
✅ MIT licensed

## 🎯 Usage

```javascript
const Agent = require('./agent');

const agent = new Agent({ type: 'github-actions' });
const results = await agent.review(files);
await agent.postComments(owner, repo, prNumber, results);
```

## 📚 Learn More

- Start: `QUICK_START_AGENT_SEPARATION.md`
- Git: `GIT_STRATEGY.md`
- API: `agent/README.md`

## 📦 Publishing

```bash
cd agent
npm publish --access public
```

## 📄 License

MIT
