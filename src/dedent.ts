/**
 * Dedent module for removing common leading whitespace from text blocks.
 * Based on the Go implementation: https://github.com/muesli/reflow/tree/master/dedent
 * 
 * Note: This is a direct port of the Go implementation, which does NOT handle ANSI
 * escape sequences specially. ANSI sequences are treated as regular non-whitespace
 * characters. For ANSI-aware dedenting, a separate implementation would be needed.
 *
 * @packageDocumentation
 */

/**
 * Finds the minimum indentation shared by all non-empty lines.
 * Empty lines (containing only whitespace and newlines) are ignored.
 * Tabs and spaces both count as one character of indentation.
 * 
 * Reference: minIndent() in https://github.com/muesli/reflow/blob/master/dedent/dedent.go
 * 
 * @param s - The input string to analyze
 * @returns The minimum indentation count
 */
function minIndent(s: string): number {
  let curIndent = 0;
  let minIndent = 0;
  let shouldAppend = true;

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    switch (char) {
      case ' ':
      case '\t':
        if (shouldAppend) {
          curIndent++;
        }
        break;
      case '\n':
        curIndent = 0;
        shouldAppend = true;
        break;
      default:
        // Found a non-whitespace character
        if (curIndent > 0 && (minIndent === 0 || curIndent < minIndent)) {
          minIndent = curIndent;
          curIndent = 0;
        }
        shouldAppend = false;
        break;
    }
  }

  return minIndent;
}

/**
 * Removes the specified number of leading whitespace characters from each line.
 * 
 * Reference: dedent() in https://github.com/muesli/reflow/blob/master/dedent/dedent.go
 * 
 * @param s - The input string
 * @param indent - The number of leading characters to remove from each line
 * @returns The dedented string
 */
function dedent(s: string, indent: number): string {
  let omitted = 0;
  let shouldOmit = true;
  let result = '';

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    switch (char) {
      case ' ':
      case '\t':
        if (shouldOmit) {
          if (omitted < indent) {
            omitted++;
            continue;
          }
          shouldOmit = false;
        }
        result += char;
        break;
      case '\n':
        omitted = 0;
        shouldOmit = true;
        result += char;
        break;
      default:
        result += char;
        break;
    }
  }

  return result;
}

/**
 * Automatically detects the maximum indentation shared by all lines and
 * trims them accordingly. Empty lines (containing only whitespace) are preserved.
 * 
 * This is a direct port of the Go implementation and does NOT handle ANSI escape
 * sequences specially - they are treated as regular non-whitespace characters.
 * 
 * Reference: String() in https://github.com/muesli/reflow/blob/master/dedent/dedent.go
 * 
 * @param s - The input string with leading whitespace
 * @returns The dedented string
 * 
 * @example
 * ```typescript
 * const input = "    line 1\n    line 2\n  line 3";
 * const output = dedentString(input);
 * // Output: "  line 1\n  line 2\nline 3"
 * ```
 *
 * @public
 */
export function dedentString(s: string): string {
  const indent = minIndent(s);
  if (indent === 0) {
    return s;
  }

  return dedent(s, indent);
}
