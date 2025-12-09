/**
 * Pad text to a specified width.
 *
 * Adds trailing spaces to ensure each line reaches the specified width,
 * while preserving ANSI escape sequences.
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";
import { isAnsiTerminator } from "./ansi";

/**
 * Custom padding function type.
 * Receives the number of padding units needed and returns the padding string.
 * @public
 */
export type PadFunc = (count: number) => string;

/**
 * Options for padding.
 * @public
 */
export interface PadOptions {
  /** Custom function to generate padding (overrides default spaces) */
  padFunc?: PadFunc;
}

/**
 * Padding writer for streaming text processing.
 *
 * Pads each line to a specified width by adding trailing spaces.
 * Preserves ANSI escape sequences and handles wide characters correctly.
 *
 * @example
 * ```ts
 * const writer = new PadWriter(20);
 * writer.write("short\ntext");
 * writer.close();
 * console.log(writer.toString());
 * // "short               \ntext                "
 * ```
 *
 * @public
 */
export class PadWriter {
  /** Target width for padding */
  readonly width: number;
  /** Custom padding function */
  readonly padFunc?: PadFunc;

  private buf = "";
  private cache = "";
  private lineLen = 0;
  private ansi = false;

  constructor(width: number, options: PadOptions = {}) {
    this.width = width;
    this.padFunc = options.padFunc;
  }

  /**
   * Write content to the padding buffer.
   */
  write(content: string): void {
    for (const char of content) {
      if (char === "\x1B") {
        this.ansi = true;
      } else if (this.ansi) {
        const code = char.charCodeAt(0);
        if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
          this.ansi = false;
        }
      } else {
        this.lineLen += stringWidth(char);

        if (char === "\n") {
          this.padLine();
          this.lineLen = 0;
        }
      }

      this.buf += char;
    }
  }

  private padLine(): void {
    if (this.width > 0 && this.lineLen > 0 && this.lineLen < this.width) {
      const padAmount = this.width - this.lineLen;
      if (this.padFunc) {
        this.buf += this.padFunc(padAmount);
      } else {
        this.buf += " ".repeat(padAmount);
      }
    }
  }

  /**
   * Finalize padding and prepare the result.
   */
  close(): void {
    if (this.lineLen !== 0) {
      this.padLine();
    }

    this.cache = this.buf;
    this.buf = "";
    this.lineLen = 0;
    this.ansi = false;
  }

  /**
   * Get the padded result as a string.
   */
  toString(): string {
    return this.cache;
  }
}

/**
 * Pad a string to the specified width.
 *
 * Adds trailing spaces to each line to reach the specified width.
 * Preserves ANSI escape sequences.
 *
 * @param s - The string to pad
 * @param width - Target width for each line
 * @param options - Padding options
 * @returns The padded string
 *
 * @example
 * ```ts
 * pad("hello", 10);
 * // "hello     "
 * ```
 *
 * @public
 */
export function pad(s: string, width: number, options?: PadOptions): string {
  const writer = new PadWriter(width, options);
  writer.write(s);
  writer.close();
  return writer.toString();
}

