/**
 * React/TypeScript/JavaScript Code Analyzer - Comprehensive
 * Analyzes React, TypeScript, and JavaScript files for best practices
 * Includes 30+ rules across Tier 1 and Tier 2 categories
 */

class ReactAnalyzer {
  analyze(content, filename) {
    const issues = [];
    const lines = content.split('\n');

    let inBlockComment = false;
    let blockCommentStart = 0;
    let blockCommentContent = '';
    let componentCount = 0;

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

      // === TIER 1: CRITICAL REACT ISSUES ===

      // 1. console.log statements
      if (line.includes('console.log') && !trimmedLine.startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'CONSOLE_LOG',
          message: 'console.log should be removed or replaced with proper logging',
          suggestion: 'Remove console.log or use a logger like winston or debug'
        });
      }

      // 2. console.warn/error
      if ((line.includes('console.warn') || line.includes('console.error')) && !trimmedLine.startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'CONSOLE_OUTPUT',
          message: 'Consider using a proper logging framework',
          suggestion: 'Use a logger instead of console methods'
        });
      }

      // 3. Missing key prop in list rendering
      if (line.includes('.map(') && line.includes('<') && !line.includes('key=')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'MISSING_KEY_PROP',
          message: 'Missing key prop in list rendering',
          suggestion: 'Add unique key prop: <Item key={item.id} />'
        });
      }

      // 4. Direct state mutation
      if ((line.includes('this.state.') || line.includes('state.')) && 
          line.includes('=') && !line.includes('setState') && !line.includes('useState')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'DIRECT_STATE_MUTATION',
          message: 'Direct state mutation detected',
          suggestion: 'Use setState() or state setter functions'
        });
      }

      // 5. Missing React import
      if (line.includes('useState') && !line.includes('import')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'MISSING_IMPORT',
          message: 'React hook used but not imported',
          suggestion: 'Add: import { useState } from "react";'
        });
      }

      // 6. useEffect with empty dependency array
      if (line.includes('useEffect') && line.includes('[]')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'EFFECT_RUNS_ONCE',
          message: 'useEffect with empty deps runs only on mount',
          suggestion: 'Verify this is intentional, add dependencies if needed'
        });
      }

      // 7. Inline function definitions
      if ((line.includes('onClick=') || line.includes('onChange=')) && 
          line.includes('() =>') && !trimmedLine.startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'INLINE_FUNCTION',
          message: 'Inline function definition causes performance issues',
          suggestion: 'Define handler outside JSX or use useCallback'
        });
      }

      // 8. Missing prop types or TypeScript
      if (line.includes('export') && line.includes('function') && filename.endsWith('.tsx')) {
        if (!line.includes('interface') && !lines[index + 1]?.includes('interface')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'info',
            rule: 'MISSING_PROP_TYPES',
            message: 'Component props should be typed',
            suggestion: 'Add interface for props: interface Props { ... }'
          });
        }
      }

      // 9. Promise without error handling
      if (line.includes('.then(') && !lines.slice(index, Math.min(index + 5, lines.length)).some(l => l.includes('.catch('))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'MISSING_ERROR_HANDLING',
          message: 'Promise chain without error handling',
          suggestion: 'Add .catch() or use async/await with try-catch'
        });
      }

      // 10. var instead of const/let
      if (/\bvar\s+/.test(line) && !trimmedLine.startsWith('//')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'USE_CONST_LET',
          message: 'Use const or let instead of var',
          suggestion: 'Replace var with const (or let if reassignment needed)'
        });
      }

      // 11. Long lines
      if (line.length > 100) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'LONG_LINE',
          message: `Line is too long (${line.length} characters, max 100)`,
          suggestion: 'Break this line into multiple lines'
        });
      }

      // 12. Hardcoded secrets
      if (/(password|secret|token|api[_-]?key)\s*[:=]\s*["']/.test(line.toLowerCase())) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'HARDCODED_SECRET',
          message: 'Hardcoded secrets detected',
          suggestion: 'Use environment variables or .env files'
        });
      }

      // === TIER 1 NEW REACT-SPECIFIC FEATURES ===

      // 13. Hook Rules Enforcement - useEffect dependency array
      if (line.includes('useEffect') && !line.includes('[]')) {
        if (!lines.slice(index, Math.min(index + 5, lines.length)).some(l => l.includes(']'))) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'warning',
            rule: 'MISSING_EFFECT_DEPENDENCY',
            message: 'useEffect missing dependency array - may cause infinite loops',
            suggestion: 'Add dependency array: useEffect(() => {...}, [deps])'
          });
        }
      }

      // 14. Memory Leak Prevention - missing cleanup
      if (line.includes('useEffect') && line.includes('addEventListener')) {
        if (!lines.slice(index, Math.min(index + 8, lines.length)).some(l => l.includes('removeEventListener'))) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'warning',
            rule: 'MEMORY_LEAK_RISK',
            message: 'Event listener added without cleanup function',
            suggestion: 'Return cleanup: return () => element.removeEventListener(...)'
          });
        }
      }

      // 15. Prop Drilling Detection
      if (line.includes('props.') && /props\.\w+\./.test(line)) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'PROP_DRILLING',
          message: 'Prop drilling detected - passing props through multiple levels',
          suggestion: 'Consider Context API, Redux, or Zustand for state management'
        });
      }

      // 16. Bundle Size Warnings - large imports
      if (line.includes('import') && 
          /moment|lodash(?!\.)|underscore|jquery/.test(line) && 
          !line.includes('from') || (line.includes('from') && !line.includes('lodash-es'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'LARGE_LIBRARY_IMPORT',
          message: 'Large library imported - consider impact on bundle size',
          suggestion: 'Use lodash-es for tree-shaking or smaller alternatives'
        });
      }

      // 17. Accessibility (a11y) Checks
      if ((line.includes('<button') || line.includes('<div')) && line.includes('onClick') && 
          !line.includes('role=') && !line.includes('aria-')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'ACCESSIBILITY_MISSING',
          message: 'Interactive element missing accessibility attributes',
          suggestion: 'Add role="button" or use proper semantic HTML'
        });
      }

      // 18. TypeScript Coverage
      if (filename.endsWith('.tsx') && line.includes(':') && !line.includes('interface') && 
          !line.includes('type') && !line.includes('type Props')) {
        // Hints for type coverage
      }

      // 19. Missing alt text on images
      if (line.includes('<img') && !line.includes('alt=')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'error',
          rule: 'MISSING_ALT_TEXT',
          message: 'Image missing alt attribute',
          suggestion: 'Add: alt="description of image"'
        });
      }

      // 20. Memoization Optimization
      if (line.includes('const') && line.includes('=') && line.includes('=>') && 
          lines.slice(index, Math.min(index + 10, lines.length)).some(l => l.includes('return'))) {
        if (!line.includes('useCallback') && !line.includes('useMemo')) {
          // Hint for optimization
        }
      }

      // === TIER 2: REACT CODE QUALITY ===

      // 21. useCallback for optimization
      if (line.includes('function') && line.includes('(') && !line.includes('useCallback') && 
          lines[index - 1]?.includes('const')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'CONSIDER_USECALLBACK',
          message: 'Consider memoizing callbacks to prevent re-renders',
          suggestion: 'Wrap with useCallback: useCallback(() => {...}, [deps])'
        });
      }

      // 22. useMemo for heavy computations
      if (line.includes('Math.') || line.includes('.filter(') || line.includes('.map(')) {
        if (!line.includes('useMemo')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'info',
            rule: 'CONSIDER_USEMEMO',
            message: 'Heavy computation - consider useMemo',
            suggestion: 'Wrap with useMemo: useMemo(() => {...}, [deps])'
          });
        }
      }

      // 23. Dependency Management
      if (line.includes('import') && !line.includes('from') && line.includes('@')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'warning',
          rule: 'CHECK_PEER_DEPENDENCIES',
          message: 'Check peer dependency compatibility',
          suggestion: 'Verify package.json has required peer dependencies'
        });
      }

      // 24. Error Boundary Usage
      if (line.includes('try') && !lines.slice(Math.max(0, index - 10), index).some(l => l.includes('ErrorBoundary'))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'CONSIDER_ERROR_BOUNDARY',
          message: 'Consider wrapping with Error Boundary',
          suggestion: 'Use Error Boundary component for crash prevention'
        });
      }

      // 25. Custom Hook Best Practices
      if (filename.includes('use') && line.includes('function') && filename.endsWith('.ts')) {
        if (!filename.startsWith('use')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'info',
            rule: 'HOOK_NAMING',
            message: 'Custom hooks should start with "use" prefix',
            suggestion: 'Rename file to: use' + filename.split('/').pop()
          });
        }
      }

      // 26. State Management Validation
      if (line.includes('useState') && lines.slice(index, Math.min(index + 20, lines.length)).some(l => 
          /useState|useReducer|useContext/.test(l))) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'COMPLEX_STATE_MGMT',
          message: 'Multiple state hooks - consider useReducer',
          suggestion: 'Use useReducer for complex state logic'
        });
      }

      // 27. CSS-in-JS Best Practices
      if (line.includes('style=') && line.includes('{{')) {
        issues.push({
          file: filename,
          line: lineNumber,
          severity: 'info',
          rule: 'INLINE_STYLES',
          message: 'Inline styles recreated on each render',
          suggestion: 'Use CSS modules, styled-components, or useMemo'
        });
      }

      // 28. Testing Patterns
      if (filename.includes('test') || filename.includes('spec')) {
        if (!line.includes('describe') && !line.includes('it(') && !line.includes('test(')) {
          // Hints for test structure
        }
      }

      // 29. SEO Best Practices
      if (filename.includes('page') && line.includes('export')) {
        if (!lines.join(' ').includes('useHead') && !lines.join(' ').includes('Head')) {
          issues.push({
            file: filename,
            line: lineNumber,
            severity: 'info',
            rule: 'MISSING_SEO_HEAD',
            message: 'Page should have meta tags for SEO',
            suggestion: 'Use Head component or Next.js Head for meta tags'
          });
        }
      }

      // 30. Unused Imports Detection
      if (line.includes('import') && !line.includes('from React')) {
        const importMatch = line.match(/import\s+\{?\s*(\w+)/);
        if (importMatch) {
          const importedName = importMatch[1];
          const remaining = lines.slice(index + 1).join(' ');
          if (!remaining.includes(importedName) && !remaining.includes(`<${importedName}`)) {
            issues.push({
              file: filename,
              line: lineNumber,
              severity: 'warning',
              rule: 'UNUSED_IMPORT',
              message: `Imported ${importedName} but never used`,
              suggestion: 'Remove unused import statement'
            });
          }
        }
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
        message: 'Block comment appears empty',
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
        suggestion: 'Add description with details'
      });
    }

    if (commentContent.includes('fixme')) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'error',
        rule: 'FIXME_COMMENT',
        message: 'FIXME comment - resolve before production',
        suggestion: 'Create issue or fix immediately'
      });
    }

    if (commentContent.includes('bug') || commentContent.includes('hack')) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'warning',
        rule: 'TEMPORARY_WORKAROUND',
        message: 'Temporary workaround detected',
        suggestion: 'Document and plan refactoring'
      });
    }

    if (blockComment.includes('/**') && !blockComment.includes('@') && blockComment.length > 100) {
      issues.push({
        file: filename,
        line: lineNumber,
        severity: 'info',
        rule: 'MISSING_JSDOC_TAGS',
        message: 'Block comment could use JSDoc tags',
        suggestion: 'Add @param, @returns, @throws tags'
      });
    }
  }
}

module.exports = ReactAnalyzer;