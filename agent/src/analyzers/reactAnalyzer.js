/**
 * React/TypeScript/JavaScript Code Analyzer
 * Analyzes React, TypeScript, and JavaScript files for common issues and best practices
 */

class ReactAnalyzer {
  analyze(content, filename) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // 1. Check for console.log statements
      if (line.includes('console.log') && !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'CONSOLE_LOG',
          message: 'console.log statements should be removed or replaced with proper logging',
          suggestion: 'Remove console.log or use a proper logger like winston or debug'
        });
      }

      // 2. Check for console.warn/error
      if ((line.includes('console.warn') || line.includes('console.error')) && 
          !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'CONSOLE_OUTPUT',
          message: 'Consider using a proper logging framework',
          suggestion: 'Use a logger instead of console methods'
        });
      }

      // 3. Check for missing key prop in lists
      if (line.includes('.map(') && line.includes('<') && !line.includes('key=')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'MISSING_KEY_PROP',
          message: 'Missing key prop in list rendering',
          suggestion: 'Add a unique key prop to list items: <Item key={item.id} />'
        });
      }

      // 4. Check for direct state mutation
      if ((line.includes('this.state.') || line.includes('state.')) && 
          line.includes('=') && !line.includes('setState')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'DIRECT_STATE_MUTATION',
          message: 'Direct state mutation detected',
          suggestion: 'Use setState() or state setter functions instead of direct assignment'
        });
      }

      // 5. Check for missing useState hook import
      if (line.includes('useState') && !line.includes('import')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'MISSING_IMPORT',
          message: 'useState used but not imported from React',
          suggestion: 'Add: import { useState } from "react";'
        });
      }

      // 6. Check for missing dependencies in useEffect
      if (line.includes('useEffect') && line.includes('[]')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'EFFECT_RUNS_ONCE',
          message: 'useEffect with empty dependency array runs only on mount',
          suggestion: 'Verify this is intentional, add dependencies if needed'
        });
      }

      // 7. Check for inline function definitions in render
      if ((line.includes('onClick=') || line.includes('onChange=')) && 
          line.includes('() =>') && !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'INLINE_FUNCTION',
          message: 'Inline function definition can cause performance issues',
          suggestion: 'Define handler function outside of JSX or use useCallback'
        });
      }

      // 8. Check for missing prop types or TypeScript types
      if (line.includes('export') && line.includes('function') && 
          !line.includes('interface') && filename.endsWith('.tsx')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'MISSING_PROP_TYPES',
          message: 'Component props should be typed',
          suggestion: 'Add interface for props: interface Props { ... }'
        });
      }

      // 9. Check for missing error handling in promises
      if (line.includes('.then(') && !lines.slice(index, Math.min(index + 5, lines.length)).some(l => l.includes('.catch('))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'MISSING_ERROR_HANDLING',
          message: 'Promise chain without error handling',
          suggestion: 'Add .catch() handler or use async/await with try-catch'
        });
      }

      // 10. Check for var usage (should use const/let)
      if (/\bvar\s+/.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'USE_CONST_LET',
          message: 'Use const or let instead of var',
          suggestion: 'Replace var with const (or let if reassignment is needed)'
        });
      }

      // 11. Check for long lines
      if (line.length > 100) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'LONG_LINE',
          message: `Line is too long (${line.length} characters, max recommended is 100)`,
          suggestion: 'Consider breaking this line into multiple lines'
        });
      }

      // 12. Check for hardcoded sensitive data
      if (/(password|secret|token|api[_-]?key)\s*[:=]\s*["']/.test(line.toLowerCase())) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'HARDCODED_SECRET',
          message: 'Hardcoded secrets/passwords detected',
          suggestion: 'Use environment variables or .env files for secrets'
        });
      }
    });

    return issues;
  }
}

module.exports = ReactAnalyzer;
