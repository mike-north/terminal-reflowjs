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

import * as ansi from "./ansi";

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
 * @public
 */
export function newWriter(width: number, options?: MarginOptions): MarginWriter {
  const opts = options || {};
  const left = opts.left || 0;
  const right = opts.right || 0;
  const top = opts.top || 0;
  const bottom = opts.bottom || 0;

  let buffer = '';
  let contentBuffer = '';
  let closed = false;

  // Import indent and padding utilities
  const indentLine = (s: string, indentWidth: number): string => {
    if (indentWidth === 0) return s;
    let result = '';
    let lineStart = true;
    
    for (let i = 0; i < s.length; i++) {
      const char = s[i];
      
      // Only add indent if the line is not empty (not just a newline)
      if (lineStart && char !== '\n') {
        result += ' '.repeat(indentWidth);
        lineStart = false;
      }
      
      result += char;
      
      if (char === '\n') {
        lineStart = true;
      }
    }
    
    return result;
  };

  const padLine = (line: string, targetWidth: number): string => {
    if (targetWidth === 0) return line;
    
    // Use ANSI stripping for length calculation
    const visibleLen = ansi.printableLength(line);
    const padWidth = Math.max(0, targetWidth - visibleLen);
    
    return line + ' '.repeat(padWidth);
  };

  return {
    write(s: string): void {
      if (closed) {
        throw new Error('Writer is closed');
      }
      contentBuffer += s;
    },

    close(): void {
      if (closed) return;
      
      // Add top margin (empty lines)
      if (top > 0) {
        buffer += '\n'.repeat(top);
      }

      // Process content: apply left indent and right padding
      if (contentBuffer.length > 0) {
        // First apply left indent
        let processed = indentLine(contentBuffer, left);
        
        // Then apply right padding if width is specified
        if (width > 0) {
          const lines = processed.split('\n');
          const paddedLines = lines.map((line, idx) => {
            // Don't pad empty lines (including trailing empty line)
            if (line === '') {
              return line;
            }
            return padLine(line, width);
          });
          processed = paddedLines.join('\n');
        }
        
        buffer += processed;
      }

      // Add bottom margin (empty lines)
      if (bottom > 0) {
        buffer += '\n'.repeat(bottom);
      }

      closed = true;
    },

    toString(): string {
      return buffer;
    }
  };
}

/**
 * Adds margins around text.
 *
 * This is a convenience function that applies margins to text content.
 *
 * @param s - The text to add margins to
 * @param options - The margin options
 * @returns The text with margins applied
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
export function margin(s: string, options?: MarginOptions): string {
  const opts = options ?? {};
  const left = opts.left ?? 0;
  const right = opts.right ?? 0;
  
  // Calculate total width if right margin is specified
  // Width = content width + left + right
  const width = right > 0 ? (s.split('\n').reduce((max, line) => {
    return Math.max(max, ansi.printableLength(line));
  }, 0) + left + right) : 0;
  
  const writer = newWriter(width, options);
  writer.write(s);
  writer.close();
  return writer.toString();
}
