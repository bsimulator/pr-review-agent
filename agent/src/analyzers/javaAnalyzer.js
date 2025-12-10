/**
 * Java Code Analyzer
 * Analyzes Java files for common issues and best practices
 */

class JavaAnalyzer {
  analyze(content, filename) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // 1. Check for System.out.println (logging)
      if (line.includes('System.out.println') && !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'USE_LOGGING_FRAMEWORK',
          message: 'Use a logging framework (SLF4J, Log4j) instead of System.out.println',
          suggestion: 'Replace with logger.info() or logger.debug()'
        });
      }

      // 2. Check for System.err.println
      if (line.includes('System.err.println') && !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'USE_LOGGING_FRAMEWORK',
          message: 'Use a logging framework instead of System.err.println',
          suggestion: 'Replace with logger.error()'
        });
      }

      // 3. Check for empty catch blocks
      if (line.includes('catch') && line.includes('{}')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'EMPTY_CATCH_BLOCK',
          message: 'Empty catch blocks should be avoided',
          suggestion: 'Add proper error handling or at least log the exception'
        });
      }

      // 4. Check for TODO comments without context
      if (line.includes('// TODO') && !line.split('TODO')[1]?.trim()) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'INCOMPLETE_TODO',
          message: 'TODO comment should have a description',
          suggestion: 'Add details about what needs to be done'
        });
      }

      // 5. Check for magic numbers
      if (/\b\d{3,}\b/.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'MAGIC_NUMBER',
          message: 'Magic numbers should be extracted to named constants',
          suggestion: 'Create a constant like: private static final int CONSTANT_NAME = ...'
        });
      }

      // 6. Check for missing access modifiers in class declaration
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

      // 7. Check for very long lines
      if (line.length > 120) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'LONG_LINE',
          message: `Line is too long (${line.length} characters, max recommended is 120)`,
          suggestion: 'Consider breaking this line into multiple lines'
        });
      }

      // 8. Check for unused variables
      if (/^\s*(private|public|protected)?\s+\w+\s+\w+\s*=\s*/.test(line) && 
          !lines.slice(index + 1, Math.min(index + 10, lines.length)).some(l => 
            l.includes(line.match(/\w+\s*=/)?.[0]?.split('=')[0]?.trim()))) {
        // Simplified heuristic
      }

      // 9. Check for Thread.sleep
      if (line.includes('Thread.sleep')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'THREAD_SLEEP',
          message: 'Avoid Thread.sleep() in production code',
          suggestion: 'Use proper synchronization primitives or scheduled executors'
        });
      }

      // 10. Check for hardcoded passwords/secrets
      if (/(password|secret|token|api[_-]?key)\s*=\s*["']/.test(line.toLowerCase())) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'HARDCODED_SECRET',
          message: 'Hardcoded secrets/passwords detected',
          suggestion: 'Use environment variables or configuration files for secrets'
        });
      }

      // 11. Check for wildcard imports
      if (line.includes('import') && line.includes('.*')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'WILDCARD_IMPORT',
          message: 'Avoid wildcard imports',
          suggestion: 'Import specific classes instead of using .*'
        });
      }

      // 12. Check for potential null pointer dereference
      if (/\.\w+\(|\.length|\.equals/.test(line) && !line.includes('null') && !line.includes('!=')) {
        // This is a heuristic, could have false positives
      }
    });

    return issues;
  }
}

module.exports = JavaAnalyzer;
