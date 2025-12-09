/**
 * Word-wrap text at a specified width.
 *
 * This module provides utilities for wrapping text at word boundaries,
 * ensuring that words are not broken across lines unless absolutely necessary.
 *
 * @example
 * ```ts
 * import { wordwrap } from 'terminal-reflowjs';
 *
 * const wrapped = wordwrap("Hello World!", 5);
 * // Result:
 * // Hello
 * // World!
 * ```
 *
 * @packageDocumentation
 */

/**
 * Writer interface for word-wrap text processing.
 *
 * Compatible with io.Writer / io.WriteCloser patterns from Go.
 *
 * @public
 */
export interface WordWrapWriter {
  /**
   * Writes a string to the output.
   * @param s - The string to write
   */
  write(s: string): void;

  /**
   * Closes the writer and finalizes output.
   */
  close(): void;

  /**
   * Returns the wrapped string result.
   */
  toString(): string;
}

/**
 * Options for word wrapping.
 * @public
 */
export interface WordWrapOptions {
  /** The maximum width for wrapped lines */
  limit?: number;
  /** Characters that can be used as breakpoints (default: space) */
  breakpoints?: string[];
  /** Characters that represent newlines */
  newline?: string[];
}

/**
 * Creates a new WordWrap writer with the specified limit.
 *
 * @param limit - The maximum width for wrapped lines
 * @returns A new WordWrapWriter instance
 * @throws {@link Error} Not yet implemented
 * @public
 */
export function newWriter(limit: number): WordWrapWriter {
  throw new Error("wordwrap.newWriter() not yet implemented");
}

/**
 * Word-wraps a string to the specified width.
 *
 * This is a convenience function that wraps text at word boundaries.
 * Words will not be broken unless they exceed the limit.
 *
 * @param s - The string to wrap
 * @param limit - The maximum width for lines
 * @returns The wrapped text
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * const result = wordwrap("Hello World!", 5);
 * console.log(result);
 * // Hello
 * // World!
 * ```
 *
 * @public
 */
export function wordwrap(s: string, limit: number): string {
  throw new Error("wordwrap.wordwrap() not yet implemented");
}
