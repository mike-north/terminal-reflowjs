/**
 * Unconditional (hard) wrapping at exact character limits.
 *
 * This module provides utilities for hard-wrapping text at a specific
 * character width, breaking lines regardless of word boundaries.
 *
 * @example
 * ```ts
 * import { wrap } from 'terminal-reflowjs';
 *
 * const wrapped = wrap("Hello World!", 7);
 * // Result:
 * // Hello W
 * // orld!
 * ```
 *
 * @remarks
 * This wrapping method can be used in conjunction with word-wrapping
 * when word-wrapping is preferred but a line limit has to be enforced.
 *
 * @packageDocumentation
 */

/**
 * Writer interface for hard-wrap text processing.
 *
 * Compatible with io.Writer patterns from Go.
 *
 * @public
 */
export interface WrapWriter {
  /**
   * Writes a string to the output.
   * @param s - The string to write
   */
  write(s: string): void;

  /**
   * Returns the wrapped string result.
   */
  toString(): string;
}

/**
 * Options for hard wrapping.
 * @public
 */
export interface WrapOptions {
  /** The maximum width for wrapped lines */
  limit?: number;
  /** Characters that represent newlines */
  newline?: string[];
  /** Whether to preserve existing newlines (default: true) */
  keepNewlines?: boolean;
  /** Whether to preserve trailing space at end of lines */
  preserveSpace?: boolean;
  /** Width of tab characters (default: 4) */
  tabWidth?: number;
}

/**
 * Creates a new hard-wrap writer with the specified limit.
 *
 * @param limit - The maximum width for wrapped lines
 * @returns A new WrapWriter instance
 * @throws {@link Error} Not yet implemented
 * @public
 */
export function newWriter(limit: number): WrapWriter {
  throw new Error("wrap.newWriter() not yet implemented");
}

/**
 * Hard-wraps a string to the specified width.
 *
 * This is a convenience function that wraps text at exact character
 * boundaries, regardless of word breaks.
 *
 * @param s - The string to wrap
 * @param limit - The exact width for lines
 * @returns The wrapped text
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * const result = wrap("Hello World!", 7);
 * console.log(result);
 * // Hello W
 * // orld!
 * ```
 *
 * @public
 */
export function wrap(s: string, limit: number): string {
  throw new Error("wrap.wrap() not yet implemented");
}
