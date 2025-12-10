/**
 * Java Code Analyzer - Comprehensive
 * Analyzes Java files for security, performance, quality, and best practices
 * Includes 30+ rules across Tier 1 and Tier 2 categories
 */

class JavaAnalyzer {
  analyze(content, filename) {
    const issues = [];
    const lines = content.split('\n');

    let inBlockComment = false;
    let blockCommentStart = 0;
    let blockCommentContent = '';

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Handle block comments
      if (trimmedLine.startsWith('/*')) {
        inBlockComment = true;
        blockCommentStart = lineNumber;
        blockCommentContent = line;
      } else if (inBlockComment) {
        blockCommentContent += '\n' + line;
        if (trimmedLine.includes('*/')) {
          inBlockComment = false;
          this.analyzeBlockComment(blockCommentContent, blockCommentStart, filename, issues);
          blockCommentContent = '';
        }
      }

      if (inBlockComment) return;

      // === TIER 1: CRITICAL SECURITY & QUALITY ISSUES ===

      // 1. System.out/err.println
      if (line.includes('System.out.println') || line.includes('System.err.println')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'USE_LOGGING_FRAMEWORK',
          message: 'Use a logging framework instead of System.out/err.println',
          suggestion: 'Replace with logger.info() or logger.error()'
        });
      }

      // 2. Empty catch blocks
      if (line.includes('catch') && line.includes('{}')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'EMPTY_CATCH_BLOCK',
          message: 'Empty catch blocks silently ignore exceptions',
          suggestion: 'Add proper error handling or at least log the exception'
        });
      }

      // 3. TODO without description
      if (line.includes('// TODO') && !line.split('TODO')[1]?.trim()) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'INCOMPLETE_TODO',
          message: 'TODO comment without description',
          suggestion: 'Add details about what needs to be done'
        });
      }

      // 4. Magic numbers
      if (/\b\d{3,}\b/.test(line) && !trimmedLine.startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'MAGIC_NUMBER',
          message: 'Magic numbers should be extracted to named constants',
          suggestion: 'Create: private static final int CONSTANT_NAME = ...'
        });
      }

      // 5. Missing access modifiers
      if (/^\s*class\s+/.test(line) && !/(public|private|protected)/.test(line)) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'MISSING_ACCESS_MODIFIER',
          message: 'Class should have explicit access modifier',
          suggestion: 'Add public/private/protected modifier'
        });
      }

      // 6. Long lines
      if (line.length > 120) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'LONG_LINE',
          message: `Line is too long (${line.length} characters, max 120)`,
          suggestion: 'Break this line into multiple lines'
        });
      }

      // 7. Thread.sleep
      if (line.includes('Thread.sleep')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'THREAD_SLEEP',
          message: 'Avoid Thread.sleep() in production code',
          suggestion: 'Use scheduled executors or other async patterns'
        });
      }

      // 8. Hardcoded secrets
      if (/(password|secret|token|api[_-]?key|private[_-]?key)\s*[=:]\s*["']/.test(line.toLowerCase())) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'HARDCODED_SECRET',
          message: 'Hardcoded secrets detected',
          suggestion: 'Use environment variables or secure vaults'
        });
      }

      // 9. Wildcard imports
      if (line.includes('import') && line.includes('.*')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'WILDCARD_IMPORT',
          message: 'Wildcard imports make code harder to understand',
          suggestion: 'Use explicit imports instead'
        });
      }

      // 10. Missing JavaDoc on public methods
      if (/public\s+\w+\s+\w+\s*\(/.test(line) && index > 0) {
        const prevLine = lines[index - 1]?.trim() || '';
        if (!prevLine.startsWith('*') && !prevLine.includes('@') && !prevLine.includes('/**')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'warning',
            rule: 'MISSING_JAVADOC',
            message: 'Public method should have JavaDoc',
            suggestion: 'Add /** @param @return @throws */ comment'
          });
        }
      }

      // 11. Nested loops
      if (line.includes('for') && lines.slice(Math.max(0, index - 5), index).some(l => l.includes('for'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'NESTED_LOOPS',
          message: 'Nested loops detected - review performance',
          suggestion: 'Consider streams or refactoring'
        });
      }

      // 12. SQL Injection Risk
      if (/(query|statement|execute)\s*[=]\s*["'].*(\$\{|\+)|\.setString/.test(line) && 
          !line.includes('PreparedStatement') && !line.includes('?')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'SQL_INJECTION_RISK',
          message: 'Potential SQL injection - using string concatenation',
          suggestion: 'Use PreparedStatement with ? placeholders'
        });
      }

      // 13. NullPointerException Risk
      if ((/\.toString\(\)|\.equals\(|\.length(?!\s*>)/.test(line)) && 
          !lines.slice(Math.max(0, index - 3), index).some(l => l.includes('!= null') || l.includes('null check'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'NULL_POINTER_RISK',
          message: 'Potential NullPointerException - no null check',
          suggestion: 'Add: if (object != null) { ... }'
        });
      }

      // 14. Hardcoded Database URLs
      if (/(jdbc|database|host|connection|url)\s*[=:]\s*["']/.test(line.toLowerCase()) && 
          /localhost|127\.0\.0\.1|192\.168/.test(line)) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'HARDCODED_DATABASE_URL',
          message: 'Hardcoded database URL detected',
          suggestion: 'Use configuration files or environment variables'
        });
      }

      // 15. Resource Leak - Unclosed Resources
      if ((line.includes('new FileInputStream') || line.includes('new BufferedReader') || 
           line.includes('getConnection')) && 
          !lines.slice(index, Math.min(index + 10, lines.length)).some(l => l.includes('close()') || l.includes('try-with-resources'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'RESOURCE_LEAK',
          message: 'Resource opened without cleanup - memory leak risk',
          suggestion: 'Use try-with-resources: try (Resource r = ...) { ... }'
        });
      }

      // 16. Log Level Misuse
      if ((line.includes('log.debug') || line.includes('log.info')) && 
          /performance|timing|benchmark|duration|elapsed|latency/.test(line.toLowerCase())) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'LOG_LEVEL_MISUSE',
          message: 'Performance metrics should use metrics library',
          suggestion: 'Use Micrometer, Prometheus or metrics framework'
        });
      }

      // 17. Test Coverage Hint
      if (/public\s+\w+\s+\w+\s*\(/.test(line) && 
          lines.slice(index, Math.min(index + 10, lines.length)).some(l => l.includes('&&') || l.includes('||') || l.includes('?'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'TEST_COVERAGE_HINT',
          message: 'Complex public method should have unit tests',
          suggestion: 'Add tests for multiple code paths'
        });
      }

      // === TIER 2: CODE QUALITY & BEST PRACTICES ===

      // 18. Stream API Best Practices
      if (/for\s*\(.*int\s+\w+.*\)/.test(line) && 
          lines.slice(index, Math.min(index + 10, lines.length)).some(l => l.includes('.add') || l.includes('.filter'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'USE_STREAM_API',
          message: 'Traditional loop could use Stream API',
          suggestion: 'Use .stream().filter().map().collect()'
        });
      }

      // 19. Exception Handling Quality
      if (line.includes('catch (Exception ') && !line.includes('catch (Exception e)')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'GENERIC_EXCEPTION',
          message: 'Catching generic Exception is too broad',
          suggestion: 'Catch specific exceptions: IOException, SQLException'
        });
      }

      // 20. Thread Safety Issues
      if (line.includes('static') && line.includes('private') && !line.includes('final') && !line.includes('synchronized')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'THREAD_SAFETY_RISK',
          message: 'Mutable shared state - thread safety concern',
          suggestion: 'Use synchronization or immutable data'
        });
      }

      // 21. Resource Management
      if ((line.includes('FileInputStream') || line.includes('Connection') || line.includes('Socket')) && 
          !line.includes('try') && index > 0 && !lines[index - 1].includes('try')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'RESOURCE_MANAGEMENT',
          message: 'Resource should use try-with-resources',
          suggestion: 'try (Resource r = new Resource()) { ... }'
        });
      }

      // 22. Performance Hotspots - String concatenation in loops
      if (line.includes('+') && /["']\s*\+\s*|\+\s*["']/.test(line)) {
        const prevLines = lines.slice(Math.max(0, index - 5), index).join(' ');
        if (prevLines.includes('for') || prevLines.includes('while')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'warning',
            rule: 'PERFORMANCE_HOTSPOT',
            message: 'String concatenation in loop - performance issue',
            suggestion: 'Use StringBuilder: new StringBuilder().append(...)'
          });
        }
      }

      // 23. Cyclomatic Complexity
      if ((line.match(/&&|\|\|/g) || []).length > 2) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'HIGH_COMPLEXITY',
          message: 'Complex conditional logic detected',
          suggestion: 'Extract to separate method or use strategy pattern'
        });
      }

      // 24. Unreachable Code
      if (line.includes('return') && 
          lines.slice(index + 1, Math.min(index + 5, lines.length)).some(l => 
              /^\s*\w+\s*=|\w+\(/.test(l) && !l.includes('//') && l.trim())) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'UNREACHABLE_CODE',
          message: 'Code after return statement is unreachable',
          suggestion: 'Remove dead code'
        });
      }

      // 25. Naming Conventions
      if (/\b[a-z][a-z0-9]*_[a-z0-9]*\b/.test(line) && line.includes('=')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'NAMING_CONVENTION',
          message: 'Variable uses snake_case instead of camelCase',
          suggestion: 'Use camelCase: myVariable instead of my_variable'
        });
      }

      // 26. Annotation Misuse
      if (line.includes('@Override') && index + 1 < lines.length) {
        if (!lines[index + 1]?.includes('public') && !lines[index + 1]?.includes('protected')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'info',
            rule: 'ANNOTATION_PLACEMENT',
            message: '@Override should be on method declaration',
            suggestion: 'Place @Override directly above the method signature'
          });
        }
      }

      // 27. API Design Review
      if (line.includes('public') && line.includes('String') && line.includes('parse')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'API_DESIGN',
          message: 'Parse methods should document expected format and exceptions',
          suggestion: 'Add JavaDoc with @throws for parsing failures'
        });
      }

      // 28. Dead Code Detection
      if (line.includes('return') && !trimmedLine.startsWith('//')) {
        const nextCode = lines.slice(index + 1, index + 3).find(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('}'));
        if (nextCode && /^\s*\w+/.test(nextCode)) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'warning',
            rule: 'UNREACHABLE_CODE',
            message: 'Unreachable code detected after return',
            suggestion: 'Review and remove dead code'
          });
        }
      }

      // 29. useMemo/useCallback equivalent - complex initialization
      if (line.includes('private static final') && line.includes('new') && 
          lines.slice(index, Math.min(index + 5, lines.length)).some(l => l.includes('{'))) {
        // Hint for complex initialization
      }

      // 30. Error Handling Strategy
      if (line.includes('throws Exception')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'THROWS_GENERIC_EXCEPTION',
          message: 'Methods should throw specific exceptions',
          suggestion: 'Throw IOException, SQLException, etc. instead of generic Exception'
        });
      }
    });

    return issues;
  }

  analyzeBlockComment(blockComment, lineNumber, filename, issues) {
    const commentLines = blockComment.split('\n');
    
    if (commentLines.length <= 2) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'info',
        rule: 'EMPTY_BLOCK_COMMENT',
        message: 'Block comment appears to be empty',
        suggestion: 'Remove or add meaningful documentation'
      });
      return;
    }

    const commentContent = blockComment.toLowerCase();
    
    if (commentContent.includes('todo') && !blockComment.split('TODO')[1]?.trim()) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'warning',
        rule: 'INCOMPLETE_TODO_BLOCK',
        message: 'Incomplete TODO in block comment',
        suggestion: 'Add description with assignee and deadline'
      });
    }

    if (commentContent.includes('fixme')) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'error',
        rule: 'FIXME_COMMENT',
        message: 'FIXME comment - resolve before production',
        suggestion: 'Create ticket or resolve immediately'
      });
    }

    if (commentContent.includes('bug') || commentContent.includes('hack')) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'warning',
        rule: 'TEMPORARY_WORKAROUND',
        message: 'Temporary workaround detected',
        suggestion: 'Document why and plan refactoring'
      });
    }

    if (blockComment.includes('/**')) {
      if (!blockComment.includes('@param') && !blockComment.includes('@return') && 
          !blockComment.includes('@throws') && blockComment.length > 50) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'INCOMPLETE_JAVADOC',
          message: 'JavaDoc missing @param/@return/@throws',
          suggestion: 'Add documentation tags for completeness'
        });
      }
    }
  }
}

module.exports = JavaAnalyzer;