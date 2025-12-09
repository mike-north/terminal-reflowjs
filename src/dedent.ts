/**
 * Remove common leading whitespace from text.
 *
 * Detects the minimum indentation across all lines and removes it,
 * effectively "dedenting" the text.
 *
 * @packageDocumentation
 */

import { ANSI_MARKER } from "./ansi";

function countLeadingWhitespace(line: string): number {
  let count = 0;

  for (const ch of line) {
    if (ch === ANSI_MARKER) {
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

function isBlankLine(line: string): boolean {
  for (const ch of line) {
    if (ch !== " " && ch !== "\t") {
      return false;
    }
  }
  return true;
}

/**
 * Remove common leading whitespace from text.
 *
 * Detects the minimum indentation (count of leading whitespace characters)
 * across all non-empty lines and removes that many characters from each line.
 * Whitespace-only lines are stripped entirely.
 *
 * @param s - The text to dedent
 * @returns The dedented text
 *
 * @example
 * ```ts
 * const text = `
 *     Hello
 *     World
 * `;
 * dedent(text);
 * // "\nHello\nWorld\n"
 * ```
 *
 * @public
 */
export function dedent(s: string): string {
  const lines = s.split("\n");

  let minIndent = Number.POSITIVE_INFINITY;

  for (const line of lines) {
    if (line === "" || isBlankLine(line)) {
      continue;
    }

    const indent = countLeadingWhitespace(line);
    minIndent = Math.min(minIndent, indent);

    if (minIndent === 0) {
      break;
    }
  }

  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return s;
  }

  const result = lines.map((line) => {
    if (line === "") {
      return line;
    }

    if (isBlankLine(line)) {
      return "";
    }

    return line.slice(minIndent);
  });

  return result.join("\n");
}
