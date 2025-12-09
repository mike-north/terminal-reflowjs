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
  return new MarginWriterImpl(width, options);
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
  const writer = new MarginWriterImpl(0, options);
  writer.write(s);
  writer.close();
  return writer.toString();
}

import { printableRuneWidth } from "./ansi";

const defaultOptions: Required<MarginOptions> = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

class MarginWriterImpl implements MarginWriter {
  private width: number;
  private opts: Required<MarginOptions>;
  private buffer = "";
  private result = "";
  private closed = false;

  constructor(width: number, options?: MarginOptions) {
    this.width = width;
    this.opts = { ...defaultOptions, ...(options ?? {}) };
  }

  write(s: string): void {
    if (this.closed) {
      throw new Error("writer already closed");
    }
    this.buffer += s;
  }

  close(): void {
    if (this.closed) return;
    this.result = this.applyMargins(this.buffer);
    this.closed = true;
  }

  toString(): string {
    if (!this.closed) {
      this.close();
    }
    return this.result;
  }

  private applyMargins(content: string): string {
    const lines = content.split("\n");
    const leftSpaces = " ".repeat(this.opts.left);

    const paddedLines = lines.map((line) => {
      const visibleWidth = printableRuneWidth(line);
      const desiredRight =
        this.opts.right ||
        (this.width > 0 ? Math.max(0, this.width - this.opts.left - visibleWidth) : 0);
      const rightSpaces = " ".repeat(desiredRight);
      return `${leftSpaces}${line}${rightSpaces}`;
    });

    const blankLine = " ".repeat(this.opts.left + this.opts.right);
    const top = Array.from({ length: this.opts.top }, () => blankLine);
    const bottom = Array.from({ length: this.opts.bottom }, () => blankLine);

    return [...top, ...paddedLines, ...bottom].join("\n");
  }
}
