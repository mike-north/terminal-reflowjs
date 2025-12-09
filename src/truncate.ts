/**
 * Writer interface for truncate text processing.
 *
 * Compatible with io.Writer patterns from Go.
 *
 * @public
 */
export interface TruncateWriter {
  /**
   * Writes a string to the output.
   * @param s - The string to write
   */
  write(s: string): void;

  /**
   * Returns the truncated string result.
   */
  toString(): string;
}

/**
 * Options for truncation.
 * @public
 */
export interface TruncateOptions {
  /** The maximum width for the truncated text */
  width?: number;
  /** The suffix to add when truncating (e.g., '...') */
  tail?: string;
}

/**
 * Creates a new truncate writer with the specified width.
 *
 * @param width - The maximum width for truncated text
 * @param tail - Optional tail string to append when truncating
 * @returns A new TruncateWriter instance
 * @throws {@link Error} Not yet implemented
 * @public
 */
export function newWriter(width: number, tail?: string): TruncateWriter {
  return new TruncateWriterImpl(width, tail);
}

/**
 * Truncates a string to the specified width.
 *
 * This is a convenience function that truncates text without
 * adding a tail indicator.
 *
 * @param s - The string to truncate
 * @param width - The maximum width
 * @returns The truncated text
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * const result = truncate("Hello World!", 7);
 * console.log(result);
 * // "Hello W"
 * ```
 *
 * @public
 */
export function truncate(s: string, width: number): string {
  return truncateWithTail(s, width, "");
}

/**
 * Truncates a string to the specified width with a custom tail.
 *
 * The tail string is included within the width limit, so the
 * actual content will be shorter to accommodate the tail.
 *
 * @param s - The string to truncate
 * @param width - The maximum width (including tail)
 * @param tail - The suffix to add when truncating
 * @returns The truncated text with tail
 * @throws {@link Error} Not yet implemented
 *
 * @example
 * ```ts
 * const result = truncateWithTail("Hello World!", 9, "...");
 * console.log(result);
 * // "Hello ..."
 * ```
 *
 * @public
 */
export function truncateWithTail(
  s: string,
  width: number,
  tail: string
): string {
  const writer = new TruncateWriterImpl(width, tail);
  writer.write(s);
  return writer.toString();
}

import stringWidth from "string-width";
import {
  ANSI_MARKER,
  AnsiWriter,
  isAnsiTerminator,
  printableRuneWidth,
} from "./ansi";

/**
 * Writer class for truncating text to a specified width.
 * Mirrors the behavior of Go's truncate.Writer while adapting to strings.
 */
class TruncateWriterImpl implements TruncateWriter {
  private width: number;
  private tail: string;
  private ansiWriter: AnsiWriter;
  private inAnsi = false;

  constructor(width: number, tail = "") {
    this.width = width;
    this.tail = tail;
    this.ansiWriter = new AnsiWriter();
  }

  write(content: string): void {
    const tailWidth = printableRuneWidth(this.tail);

    // If tail is wider than available width, write only the tail.
    if (this.width < tailWidth) {
      this.ansiWriter.write(this.tail);
      return;
    }

    const availableWidth = this.width - tailWidth;
    let currentWidth = 0;

    for (const ch of content) {
      if (ch === ANSI_MARKER) {
        this.inAnsi = true;
      } else if (this.inAnsi) {
        if (isAnsiTerminator(ch)) {
          this.inAnsi = false;
        }
      } else {
        currentWidth += stringWidth(ch);
      }

      if (currentWidth > availableWidth) {
        this.ansiWriter.write(this.tail);
        if (this.ansiWriter.getLastSequence() !== "") {
          this.ansiWriter.resetAnsi();
        }
        return;
      }

      this.ansiWriter.write(ch);
    }
  }

  toString(): string {
    return this.ansiWriter.toString();
  }
}
