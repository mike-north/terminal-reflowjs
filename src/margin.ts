/**
 * Add margins to text blocks.
 *
 * This module provides utilities for adding margins (top, bottom, left, right)
 * around text content, combining the functionality of padding and indentation.
 *
 * @example
 * ```ts
 * import { margin } from 'terminal-reflowjs';
 *
 * const result = margin("Hello", { left: 2, right: 2 });
 * // Result: "  Hello  "
 * ```
 *
 * @packageDocumentation
 */

/**
 * Writer interface for margin text processing.
 *
 * Compatible with io.WriteCloser patterns from Go.
 *
 * @public
 */
export interface MarginWriter {
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
   * Returns the string with margins applied.
   */
  toString(): string;
}

/**
 * Options for margins.
 * @public
 */
export interface MarginOptions {
  /** Top margin (number of blank lines) */
  top?: number;
  /** Bottom margin (number of blank lines) */
  bottom?: number;
  /** Left margin (number of spaces) */
  left?: number;
  /** Right margin (number of spaces / padding width) */
  right?: number;
}

/**
 * Creates a new margin writer with the specified options.
 *
 * @param width - The total width for the output
 * @param options - Margin configuration
 * @returns A new MarginWriter instance
 * @throws {@link Error} Not yet implemented
 * @public
 */
export function newWriter(width: number, options?: MarginOptions): MarginWriter {
  throw new Error("margin.newWriter() not yet implemented");
}

/**
 * Adds margins around text.
 *
 * This is a convenience function that applies margins to text content.
 *
 * @param s - The text to add margins to
 * @param options - The margin options
 * @returns The text with margins applied
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * const result = margin("Hello", { left: 2, top: 1 });
 * console.log(result);
 * //
 * //   Hello
 * ```
 *
 * @public
 */
export function margin(s: string, options: MarginOptions): string {
  throw new Error("margin.margin() not yet implemented");
}
