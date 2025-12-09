/**
 * Remove common leading whitespace from text blocks.
 *
 * This module provides utilities for removing indentation by detecting
 * the minimum common leading whitespace across all lines.
 *
 * @example
 * ```ts
 * import { dedent } from 'terminal-reflowjs';
 *
 * const input = `    Hello World!
 *   Hello World!
 * `;
 * const result = dedent(input);
 * // Result:
 * //   Hello World!
 * // Hello World!
 * ```
 *
 * @packageDocumentation
 */

/**
 * Removes common leading whitespace from text.
 *
 * Detects the minimum indentation across all non-empty lines
 * and removes that amount from each line.
 *
 * @param s - The text to dedent
 * @returns The dedented text
 * @throws {@link Error} Not yet implemented
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
  throw new Error("dedent.dedent() not yet implemented");
}
