/**
 * ANSI escape sequence parsing and handling module.
 *
 * This module provides utilities for detecting, parsing, and manipulating
 * ANSI escape sequences in terminal text. It serves as a foundation for
 * other modules that need to handle text with ANSI formatting codes.
 *
 * @packageDocumentation
 */

/**
 * Writer interface for ANSI-aware text processing.
 * @public
 */
export interface AnsiWriter {
  /**
   * Writes a string to the output.
   * @param s - The string to write
   */
  write(s: string): void;
}

/**
 * Returns a string representation with ANSI handling.
 *
 * @returns A placeholder string
 * @throws {@link Error} Not yet implemented
 * @public
 */
export function ansiString(): string {
  throw new Error("ansi.ansiString() not yet implemented");
}

/**
 * Strips ANSI escape sequences from a string.
 *
 * @param s - The string to strip
 * @returns The string without ANSI sequences
 * @public
 */
export function strip(s: string): string {
  // ANSI escape sequences start with ESC (0x1B) followed by [
  // and end with a letter (a-zA-Z) or other terminators like ~
  // This pattern covers SGR (Select Graphic Rendition) and other CSI sequences
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1B\[[0-9;]*[a-zA-Z~]/g, '');
}

/**
 * Gets the printable length of a string (excluding ANSI sequences).
 *
 * @param s - The string to measure
 * @returns The visible character count
 * @public
 */
export function printableLength(s: string): number {
  return strip(s).length;
}
