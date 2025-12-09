/**
 * ANSI escape sequence utilities
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/buffer.go
 *
 * @packageDocumentation
 */

import { eastAsianWidth } from "get-east-asian-width";

/**
 * ANSI escape sequence marker character (ESC)
 * @public
 */
export const Marker = "\x1B";

/**
 * Checks if a character is an ANSI sequence terminator
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go#L5-L7
 * 
 * ANSI escape sequences are terminated by characters in the range 0x40-0x5A or 0x61-0x7A
 * These include common terminators like 'm' (SGR), 'H' (CUP), etc.
 * 
 * @public
 */
export function isTerminator(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0x40 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

/**
 * Calculate the visual width of a rune (character)
 * Uses East Asian Width to properly handle CJK and other wide characters
 */
function runeWidth(char: string): number {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    return 0;
  }
  const width = eastAsianWidth(codePoint);
  // eastAsianWidth returns 1 or 2 for printable characters
  return width;
}

/**
 * Calculate the printable width of a string, excluding ANSI escape sequences
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/buffer.go#L15-L37
 * 
 * This function iterates through the string and:
 * - Skips ANSI escape sequences (from ESC marker to terminator)
 * - Counts the visual width of printable characters
 * 
 * @public
 */
export function printableRuneWidth(s: string): number {
  let n = 0;
  let ansi = false;

  for (const char of s) {
    if (char === Marker) {
      // Start of ANSI escape sequence
      ansi = true;
    } else if (ansi) {
      if (isTerminator(char)) {
        // End of ANSI escape sequence
        ansi = false;
      }
      // Skip characters inside ANSI sequence
    } else {
      // Regular printable character
      n += runeWidth(char);
    }
  }

  return n;
}
