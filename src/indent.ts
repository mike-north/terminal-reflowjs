/**
 * Add indentation to text blocks.
 *
 * This module provides utilities for adding leading whitespace or
 * custom prefixes to lines of text.
 *
 * @example
 * ```ts
 * import { indent } from 'terminal-reflowjs';
 *
 * const indented = indent("Hello World!", 4);
 * // Result: "    Hello World!"
 * ```
 *
 * @packageDocumentation
 */

/**
 * Function type for custom indentation.
 *
 * @param writer - The writer to output indentation to
 * @public
 */
export type IndentFunc = (writer: { write(s: string): void }) => void;

/**
 * Writer interface for indent text processing.
 *
 * Compatible with io.Writer patterns from Go.
 *
 * @public
 */
export interface IndentWriter {
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
   * Returns the indented string result.
   */
  toString(): string;
}

/**
 * Options for indentation.
 * @public
 */
export interface IndentOptions {
  /** The number of spaces to use for indentation */
  width?: number;
  /** Custom indentation function */
  indentFunc?: IndentFunc;
}

/**
 * Creates a new indent writer with the specified width.
 *
 * @param width - The number of spaces for indentation
 * @param indentFunc - Optional custom indentation function
 * @returns A new IndentWriter instance
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * // Using default spaces:
 * const writer = newWriter(4, null);
 *
 * // Using custom indentation:
 * const dotWriter = newWriter(4, (w) => w.write("."));
 * ```
 *
 * @public
 */
export function newWriter(
  width: number,
  indentFunc: IndentFunc | null
): IndentWriter {
  throw new Error("indent.newWriter() not yet implemented");
}

/**
 * Indents a string by the specified width.
 *
 * This is a convenience function that adds leading spaces to each line.
 *
 * @param s - The string to indent
 * @param width - The number of spaces to add
 * @returns The indented text
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * const result = indent("Hello World!", 4);
 * console.log(result);
 * // "    Hello World!"
 * ```
 *
 * @public
 */
export function indent(s: string, width: number): string {
  throw new Error("indent.indent() not yet implemented");
}
