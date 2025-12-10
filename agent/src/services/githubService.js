/**
 * GitHub Service
 * Handles GitHub API interactions
 */

const { Octokit } = require('@octokit/rest');

class GithubService {
  constructor(config) {
    this.token = config.token;
    this.verbose = config.verbose;
    this.octokit = new Octokit({ auth: this.token });
  }

  /**
   * Post inline comment on specific line
   */
  async postInlineComment(owner, repo, prNumber, issue) {
    try {
      await this.octokit.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        body: this.formatInlineComment(issue),
        commit_id: process.env.GITHUB_SHA,
        path: issue.file,
        line: issue.line
      });
    } catch (error) {
      if (this.verbose) {
        console.error(`Failed to post inline comment: ${error.message}`);
      }
    }
  }

  /**
   * Post main comment on PR
   */
  async postComment(owner, repo, prNumber, body) {
    try {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body
      });
    } catch (error) {
      if (this.verbose) {
        console.error(`Failed to post comment: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get PR changed files
   */
  async getPRFiles(owner, repo, prNumber) {
    try {
      const { data } = await this.octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber
      });
      return data;
    } catch (error) {
      console.error(`Failed to get PR files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format inline comment
   */
  formatInlineComment(issue) {
    const emoji = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[issue.severity] || '💬';

    return `${emoji} **${issue.rule}** (${issue.severity})
${issue.message}

💡 *Suggestion:* ${issue.suggestion}`;
  }
}

module.exports = GithubService;
