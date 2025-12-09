/**
 * Remove common leading whitespace from text blocks.
 *
 * This module provides utilities for removing indentation by detecting
 * the minimum common leading whitespace across all lines.
 *
 * Ported from: https://github.com/muesli/reflow/tree/master/dedent
 *
 * @example
 * ```ts
 * import { dedent } from 'terminal-reflowjs';
 *
 * const input = `    Hello World!
 *   Hello World!
 * `;
 * const result = dedent.dedent(input);
 * // Result:
 * //   Hello World!
 * // Hello World!
 * ```
 *
 * @packageDocumentation
 */

import { ANSI_MARKER } from "./ansi";

/**
 * Count the number of leading whitespace characters (spaces or tabs) in a line.
 * Stops counting at the first non-whitespace character or ANSI sequence.
 */
function countLeadingWhitespace(line: string): number {
  let count = 0;

  for (const ch of line) {
    if (ch === ANSI_MARKER) {
      // ANSI sequence starts - stop counting whitespace
      break;
    }

    if (ch === " " || ch === "\t") {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Check if a line contains only whitespace (or is empty).
 */
function isBlankLine(line: string): boolean {
  for (const ch of line) {
    if (ch !== " " && ch !== "\t") {
      return false;
    }
  }
  return true;
}

/**
 * Removes common leading whitespace from text.
 *
 * Detects the minimum indentation (count of leading whitespace characters)
 * across all non-empty lines and removes that many characters from each line.
 * Empty lines and lines containing only whitespace are preserved but have
 * their whitespace stripped.
 *
 * @param s - The text to dedent
 * @returns The dedented text
 *
 * @example
 * ```ts
 * const input = `    Hello World!
 *   Hello World!
 * `;
 * const result = dedent(input);
 * console.log(result);
 * //   Hello World!
 * // Hello World!
 * ```
 *
 * @public
 */
export function dedent(s: string): string {
  const lines = s.split("\n");

  // Find minimum indentation across all non-blank lines
  let minIndent = Number.POSITIVE_INFINITY;

  for (const line of lines) {
    // Skip empty lines and whitespace-only lines
    if (line === "" || isBlankLine(line)) {
      continue;
    }

    const indent = countLeadingWhitespace(line);
    minIndent = Math.min(minIndent, indent);

    // Early exit if no indentation
    if (minIndent === 0) {
      break;
    }
  }

  // If no common indentation found (all lines empty/blank or no indent), return as-is
  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return s;
  }

  // Remove the common indentation from each line
  const result = lines.map((line) => {
    // Empty lines stay empty
    if (line === "") {
      return line;
    }

    // Whitespace-only lines get fully stripped
    if (isBlankLine(line)) {
      return "";
    }

    // Remove minIndent characters from the beginning
    return line.slice(minIndent);
  });

  return result.join("\n");
}

/**
 * Alias for dedent to mirror Go API (String function).
 * @public
 */
export const dedentString = dedent;
