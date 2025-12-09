/**
 * Truncate text to a specified width.
 *
 * Shortens text to fit within a maximum width, optionally adding
 * an ellipsis or other tail indicator.
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";
import {
  ANSI_MARKER,
  AnsiBuffer,
  isAnsiTerminator,
  printableRuneWidth,
} from "./ansi";

/**
 * Options for truncation.
 * @public
 */
export interface TruncateOptions {
  /** The suffix to add when truncating (e.g., '...') */
  tail?: string;
}

/**
 * Truncate writer for streaming text processing.
 *
 * Truncates text to a maximum width while preserving ANSI escape sequences.
 * Optionally appends a tail (like "...") when content is truncated.
 *
 * @example
 * ```ts
 * const writer = new TruncateWriter(20, { tail: "..." });
 * writer.write("This is a very long string that needs truncating");
 * console.log(writer.toString());
 * // "This is a very lo..."
 * ```
 *
 * @public
 */
export class TruncateWriter {
  /** Maximum width for the output */
  readonly width: number;
  /** Tail string to append when truncating */
  readonly tail: string;

  private ansiBuffer: AnsiBuffer;
  private inAnsi = false;
  private truncated = false;

  constructor(width: number, options: TruncateOptions = {}) {
    this.width = width;
    this.tail = options.tail ?? "";
    this.ansiBuffer = new AnsiBuffer();
  }

  /**
   * Write content to the truncate buffer.
   */
  write(content: string): void {
    if (this.truncated) return;

    const tailWidth = printableRuneWidth(this.tail);

    if (this.width < tailWidth) {
      this.ansiBuffer.write(this.tail);
      this.truncated = true;
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
        this.ansiBuffer.write(this.tail);
        if (this.ansiBuffer.getLastSequence() !== "") {
          this.ansiBuffer.resetAnsi();
        }
        this.truncated = true;
        return;
      }

      this.ansiBuffer.write(ch);
    }
  }

  /**
   * Get the truncated result as a string.
   */
  toString(): string {
    return this.ansiBuffer.toString();
  }
}

/**
 * Truncate a string to the specified width.
 *
 * Shortens text to fit within a maximum width. Use the `tail` option
 * to add an indicator like "..." when content is truncated.
 *
 * @param s - The string to truncate
 * @param width - Maximum width (including tail)
 * @param options - Truncation options
 * @returns The truncated string
 *
 * @example
 * ```ts
 * truncate("Hello World", 8);
 * // "Hello Wo"
 *
 * truncate("Hello World", 8, { tail: "..." });
 * // "Hello..."
 * ```
 *
 * @public
 */
export function truncate(
  s: string,
  width: number,
  options?: TruncateOptions
): string {
  const writer = new TruncateWriter(width, options);
  writer.write(s);
  return writer.toString();
}

