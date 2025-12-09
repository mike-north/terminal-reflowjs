/**
 * Pad text to a specified width.
 *
 * This module provides utilities for padding text with spaces or
 * custom characters to achieve a desired width.
 *
 * @example
 * ```ts
 * import { pad } from 'terminal-reflowjs';
 *
 * const padded = pad("Hello", 8);
 * // Result: "Hello   " (with 3 trailing spaces)
 * ```
 *
 * @packageDocumentation
 */

/**
 * Function type for custom padding.
 *
 * @param writer - The writer to output padding to
 * @public
 */
export type PaddingFunc = (writer: { write(s: string): void }) => void;

/**
 * Writer interface for padding text processing.
 *
 * Compatible with io.WriteCloser patterns from Go.
 *
 * @public
 */
export interface PaddingWriter {
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
   * Returns the padded string result.
   */
  toString(): string;
}

/**
 * Options for padding.
 * @public
 */
export interface PaddingOptions {
  /** The target width after padding */
  width?: number;
  /** Custom padding function */
  paddingFunc?: PaddingFunc;
}

/**
 * Creates a new padding writer with the specified width.
 *
 * @param width - The target width for padded lines
 * @param paddingFunc - Optional custom padding function
 * @returns A new PaddingWriter instance
 *
 * @example
 * ```ts
 * // Using default spaces:
 * const writer = newWriter(80, null);
 *
 * // Using custom padding:
 * const dotWriter = newWriter(80, (w) => w.write("."));
 * ```
 *
 * @public
 */
export function newWriter(
  width: number,
  paddingFunc: PaddingFunc | null
): PaddingWriter {
  let buffer = '';
  let currentLine = '';
  let closed = false;

  // Import ansi utilities dynamically to avoid circular dependencies
  // eslint-disable-next-line no-control-regex
  const stripAnsi = (s: string): string => s.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  const printableLength = (s: string): number => stripAnsi(s).length;

  const padLine = (line: string): string => {
    if (width === 0) return line;
    
    const visibleLen = printableLength(line);
    const padWidth = Math.max(0, width - visibleLen);
    
    if (padWidth === 0) return line;
    
    let padding = '';
    if (paddingFunc) {
      const padWriter = { write: (str: string) => { padding += str; } };
      for (let i = 0; i < padWidth; i++) {
        paddingFunc(padWriter);
      }
    } else {
      padding = ' '.repeat(padWidth);
    }
    
    return line + padding;
  };

  return {
    write(s: string): void {
      if (closed) {
        throw new Error('Writer is closed');
      }

      for (let i = 0; i < s.length; i++) {
        const char = s[i];

        if (char === '\n') {
          buffer += padLine(currentLine) + '\n';
          currentLine = '';
        } else {
          currentLine += char;
        }
      }
    },

    close(): void {
      if (!closed) {
        // Pad any remaining line
        if (currentLine.length > 0) {
          buffer += padLine(currentLine);
        }
        closed = true;
      }
    },

    toString(): string {
      return buffer;
    }
  };
}

/**
 * Pads a string to the specified width.
 *
 * This is a convenience function that pads each line with trailing
 * spaces to reach the specified width.
 *
 * @param s - The string to pad
 * @param width - The target width
 * @returns The padded text
 *
 * @example
 * ```ts
 * const result = pad("Hello", 8);
 * console.log(result);
 * // "Hello   "
 * ```
 *
 * @public
 */
export function pad(s: string, width: number): string {
  const writer = newWriter(width, null);
  writer.write(s);
  writer.close();
  return writer.toString();
}
