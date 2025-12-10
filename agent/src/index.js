/**
 * PR Review Agent - Main Module
 * 
 * Reusable agent for reviewing pull requests.
 * Works in GitHub Actions, local CLI, and custom integrations.
 * 
 * Usage:
 * ```javascript
 * const PRReviewAgent = require('@pr-review/agent');
 * 
 * const agent = new PRReviewAgent({
 *   type: 'github-actions',  // or 'cli' or 'custom'
 * });
 * 
 * const results = await agent.review(changedFiles);
 * ```
 */

const JavaAnalyzer = require('./analyzers/javaAnalyzer');
const ReactAnalyzer = require('./analyzers/reactAnalyzer');
const CommentFormatter = require('./services/commentFormatter');
const Logger = require('./utils/logger');

class PRReviewAgent {
  /**
   * Initialize PR Review Agent
   * @param {Object} config - Configuration object
   * @param {string} config.type - Execution type: 'github-actions', 'cli', 'custom'
   * @param {string} config.token - GitHub token (optional for GitHub Actions)
   * @param {Object} config.analyzers - Custom analyzers to use
   * @param {boolean} config.verbose - Verbose logging
   */
  constructor(config = {}) {
    this.config = {
      type: 'github-actions',
      verbose: false,
      ...config
    };

    this.logger = new Logger(this.config.verbose);
    this.analyzers = this.config.analyzers || {
      java: new JavaAnalyzer(),
      react: new ReactAnalyzer()
    };

    if (this.config.type === 'github-actions' || this.config.token) {
      // Lazy load GithubService only when needed
      const GithubService = require('./services/githubService');
      this.github = new GithubService({
        token: this.config.token || process.env.GITHUB_TOKEN,
        verbose: this.config.verbose
      });
    }

    this.formatter = new CommentFormatter();
  }

  /**
   * Review changed files
   * @param {Array} changedFiles - Array of file objects or paths
   * @returns {Promise<Object>} Review results
   */
  async review(changedFiles) {
    this.logger.log(`🔍 Starting PR review of ${changedFiles.length} files...`);

    const allIssues = [];
    const fileResults = {};

    for (const file of changedFiles) {
      const filePath = typeof file === 'string' ? file : file.filename;
      const content = typeof file === 'string' ? null : file.patch || file.content;

      this.logger.log(`📄 Analyzing: ${filePath}`);

      // Determine file type and analyze
      const issues = await this.analyzeFile(filePath, content);
      
      if (issues.length > 0) {
        allIssues.push(...issues);
        fileResults[filePath] = issues;
        this.logger.log(`   ❌ Found ${issues.length} issue(s)`);
      } else {
        fileResults[filePath] = [];
        this.logger.log(`   ✅ No issues found`);
      }
    }

    const summary = this.createSummary(allIssues, fileResults);
    this.logger.log(`\n📊 Review complete: ${allIssues.length} total issue(s)`);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      filesReviewed: changedFiles.length,
      totalIssues: allIssues.length,
      issues: allIssues,
      byFile: fileResults,
      summary: summary
    };
  }

  /**
   * Analyze single file
   * @private
   */
  async analyzeFile(filePath, content) {
    const issues = [];

    // Java files
    if (filePath.endsWith('.java')) {
      const javaIssues = this.analyzers.java.analyze(content || '', filePath);
      issues.push(...javaIssues);
    }

    // React/TypeScript/JavaScript files
    if (this.isReactFile(filePath)) {
      const reactIssues = this.analyzers.react.analyze(content || '', filePath);
      issues.push(...reactIssues);
    }

    return issues;
  }

  /**
   * Check if file is React/JavaScript/TypeScript
   * @private
   */
  isReactFile(filePath) {
    const extensions = ['.jsx', '.tsx', '.ts', '.js', '.vue'];
    return extensions.some(ext => filePath.endsWith(ext));
  }

  /**
   * Create summary of issues
   * @private
   */
  createSummary(allIssues, fileResults) {
    const stats = {
      total: allIssues.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length,
      fileCount: Object.keys(fileResults).length,
      filesWithIssues: Object.keys(fileResults).filter(f => fileResults[f].length > 0).length
    };

    return stats;
  }

  /**
   * Post comments to GitHub PR (GitHub Actions only)
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} prNumber - Pull request number
   * @param {Object} reviewResults - Results from review()
   */
  async postComments(owner, repo, prNumber, reviewResults) {
    if (!this.github) {
      throw new Error('GitHub service not initialized. Use GitHub token in config.');
    }

    this.logger.log(`📝 Posting comments to PR #${prNumber}...`);

    // Post inline comments
    for (const issue of reviewResults.issues) {
      await this.github.postInlineComment(
        owner,
        repo,
        prNumber,
        issue
      );
    }

    // Post summary comment
    const summaryComment = this.formatter.formatSummary(reviewResults);
    await this.github.postComment(
      owner,
      repo,
      prNumber,
      summaryComment
    );

    this.logger.log(`✅ Comments posted successfully`);
  }

  /**
   * Add custom analyzer
   * @param {string} fileType - File extension (e.g., 'py' for Python)
   * @param {Object} analyzer - Analyzer instance with analyze() method
   */
  addAnalyzer(fileType, analyzer) {
    this.analyzers[fileType] = analyzer;
    this.logger.log(`✅ Custom analyzer added for .${fileType}`);
  }
}

module.exports = PRReviewAgent;
