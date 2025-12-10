# 🌳 Git Strategy for PR Review Agent

## Overview

You now have a reusable **agent package** (in `/agent`) that anyone can use separately from your working project. Here's the recommended git structure.

## 📦 Repository Structure

```
pr-review-agent/                (Main repo)
├── agent/                       (The reusable package)
│   ├── package.json
│   ├── README.md
│   ├── src/
│   │   ├── index.js
│   │   ├── analyzers/
│   │   ├── services/
│   │   └── utils/
│   ├── examples/
│   ├── tests/
│   └── .gitignore
│
├── backend/                     (Legacy - optional to keep)
│   ├── package.json
│   ├── review-local.js
│   └── src/
│
├── docs/                        (Documentation)
│
├── examples/                    (Usage examples)
│
└── .github/
    └── workflows/
        └── pr-review.yml        (GitHub Actions)
```

## 🔄 Recommended Git Strategy

### Option 1: Monorepo (All in One) - ⭐ RECOMMENDED

**Best for:** If you want to maintain everything together but keep agent separate

```
main branch
├── agent/ (stable releases)
├── backend/ (examples, legacy)
├── docs/
└── examples/

develop branch
├── agent/ (development)
├── new features
└── experimental code
```

**Git Commands:**
```bash
# Clone the repo
git clone https://github.com/yourusername/pr-review-agent.git
cd pr-review-agent

# Create feature branch for new analyzer
git checkout -b feature/python-analyzer

# Make changes in agent/
# Stage and commit
git add agent/src/analyzers/pythonAnalyzer.js
git commit -m "feat(agent): add Python analyzer"

# Push
git push origin feature/python-analyzer

# Create PR to develop branch
# After review, merge to develop
# Later, merge develop to main for release
```

### Option 2: Separate Repositories

**Best for:** If you want agent as independent npm package

```
pr-review-agent (this repo)     agent-pkg (separate npm)
├── agent/              →→→      ├── src/
├── backend/                     ├── tests/
├── examples/                    ├── package.json
└── docs/                        └── README.md
```

**Setup:**
```bash
# Create new repo for agent
git clone https://github.com/yourusername/agent-pkg.git
cd agent-pkg

# Copy agent contents here
cp -r ../pr-review-agent/agent/* .

# Publish to npm
npm publish
```

### Option 3: Git Subtree (Hybrid)

**Best for:** If you want both separate control and synchronized versions

```bash
# In main repo, add agent as subtree
git subtree add --prefix agent https://github.com/yourusername/agent-pkg.git main --squash

# Make changes and push to both
git subtree push --prefix agent https://github.com/yourusername/agent-pkg.git main
```

## 📋 Recommended Branching Strategy

### Branch Structure

```
main (stable releases)
 ├─ develop (integration branch)
 │  ├─ feature/java-analyzer (temp)
 │  ├─ feature/python-analyzer (temp)
 │  ├─ bugfix/comment-format (temp)
 │  └─ docs/update-readme (temp)
 │
 └─ release/v2.1.0 (temp, for releases)
```

### Naming Convention

```
feature/*           New features
  feature/java-analyzer
  feature/custom-rules

bugfix/*            Bug fixes
  bugfix/github-token-issue
  bugfix/comment-formatting

docs/*              Documentation
  docs/update-readme
  docs/api-reference

chore/*             Maintenance
  chore/update-dependencies
  chore/setup-tests

release/*           Release branches
  release/v2.0.0
  release/v2.1.0
```

## 📝 Workflow Example

### Scenario: Add Python Analyzer

**Step 1: Create feature branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/python-analyzer
```

**Step 2: Make changes**
```bash
# Create analyzer
echo "class PythonAnalyzer { ... }" > agent/src/analyzers/pythonAnalyzer.js

# Write tests
echo "describe('PythonAnalyzer', ...) { ... }" > agent/tests/pythonAnalyzer.test.js

# Update docs
echo "## Python Analyzer" >> agent/README.md
```

**Step 3: Test locally**
```bash
cd agent
npm install
npm test
npm run lint
```

**Step 4: Commit**
```bash
git add agent/src/analyzers/pythonAnalyzer.js
git add agent/tests/pythonAnalyzer.test.js
git add agent/README.md

git commit -m "feat(agent): add Python code analyzer

- Detects print statements (use logging)
- Checks for hardcoded secrets
- Validates error handling

Closes #123"
```

**Step 5: Push and PR**
```bash
git push origin feature/python-analyzer

# Create PR to develop branch
# Wait for review and tests to pass
# Merge via GitHub UI
```

**Step 6: Release**
```bash
# When ready to release
git checkout develop
git pull origin develop

git checkout -b release/v2.1.0

# Update version in agent/package.json
vim agent/package.json  # version: 2.1.0

# Commit
git commit -am "chore: release v2.1.0"

# Push release branch
git push origin release/v2.1.0

# Create PR to main
# After merge, tag release
git checkout main
git pull origin main
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0
```

## 🚀 Deployment Strategy

### For Local Development

```bash
# Link local agent in development
cd agent
npm link

# Use it in your project
cd ../my-project
npm link @pr-review/agent
npm run review
```

### For npm Registry

```bash
# Setup npm credentials
npm login

# Publish from agent directory
cd agent
npm publish

# Others install it
npm install @pr-review/agent
```

### For GitHub Releases

```bash
# Tag releases
git tag v2.0.0
git push origin v2.0.0

# GitHub Actions can auto-publish
```

## 📊 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Tests
- `chore` - Build, dependencies

**Examples:**
```
feat(agent): add Python analyzer
fix(java): improve empty catch detection
docs(readme): update installation instructions
refactor(formatters): simplify comment logic
```

## 🔍 Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature (non-breaking)
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes
- Test cases added
- Documentation updated

## Testing
How to test this PR:
```bash
npm install
npm test
```

## Checklist
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Comments added
- [ ] Documentation updated
- [ ] No breaking changes

## Related Issues
Closes #123
```

## ✅ CI/CD Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: cd agent && npm install
      
      - name: Run tests
        run: cd agent && npm test
      
      - name: Lint code
        run: cd agent && npm run lint

  publish:
    if: github.ref == 'refs/heads/main' && startsWith(github.ref, 'refs/tags/')
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      
      - name: Publish to npm
        run: cd agent && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📈 Version Strategy

```
v2.0.0
^^^^^
MAJOR.MINOR.PATCH

MAJOR - Breaking changes (new, incompatible API)
MINOR - New features (backward compatible)
PATCH - Bug fixes (backward compatible)
```

## 🚨 Important Rules

### For Main Branch
- ✅ Only stable, tested code
- ✅ All tests passing
- ✅ Code reviewed
- ✅ Can be released anytime

### For Develop Branch
- ✅ Integration branch
- ✅ May have features not in main
- ✅ Must be stable enough for next release
- ✅ Feature branches merge here

### For Feature Branches
- ✅ Short-lived (1-2 weeks max)
- ✅ One feature per branch
- ✅ Delete after merge
- ✅ Must have tests

## 📦 Making Agent a Separate Package

### If you decide to split agent into its own repo:

```bash
# 1. Create new GitHub repo: agent-pkg

# 2. Extract agent directory
git clone https://github.com/yourusername/pr-review-agent.git temp
cd temp
git filter-branch --subdirectory-filter agent -- --all
cd ..

# 3. Push to new repo
git clone --bare temp agent-pkg.git
cd agent-pkg.git
git push --mirror https://github.com/yourusername/agent-pkg.git

# 4. Clean up
rm -rf temp agent-pkg.git

# 5. Update main repo to reference new package
cd pr-review-agent
npm install @yourusername/agent-pkg
```

## 🎯 Summary

| Strategy | Best For | Setup Time | Maintenance |
|----------|----------|-----------|-------------|
| **Monorepo** | Keeping everything together | 5 min | Easy |
| **Separate Repos** | Independent npm packages | 15 min | Moderate |
| **Subtree** | Best of both worlds | 10 min | Complex |

**Recommendation:** Start with **Monorepo** (Option 1) - it's simplest and you can always split later!

---

**Ready to commit?** Follow these guidelines for clean, organized development! 🚀
