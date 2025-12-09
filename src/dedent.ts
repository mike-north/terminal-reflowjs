/**
 * Remove common leading whitespace from text blocks.
 * 
 * This module provides utilities for removing indentation by detecting
 * the minimum common leading whitespace across all lines.
 */

/**
 * Writer interface for dedent text processing.
 */
export interface DedentWriter {
  /**
   * Writes a string to the output.
   * @param s - The string to write
   */
  write(s: string): void;
}

/**
 * Returns a dedented string representation.
 * 
 * @returns A placeholder string
 * @throws {Error} Not yet implemented
 */
export function dedentString(): string {
  throw new Error("dedent.dedentString() not yet implemented");
}

/**
 * Removes common leading whitespace from text.
 * 
 * @param text - The text to dedent
 * @returns The dedented text
 * @throws {Error} Not yet implemented
 */
export function dedent(text: string): string {
  throw new Error("dedent.dedent() not yet implemented");
}
