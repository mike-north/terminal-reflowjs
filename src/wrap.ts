/**
 * Unconditional (hard) wrapping at exact character limits.
 *
 * This module provides utilities for hard-wrapping text at a specific
 * character width, breaking lines regardless of word boundaries.
 *
 * Ported from: https://github.com/muesli/reflow/tree/master/wrap
 *
 * @example
 * ```ts
 * import { wrap } from 'terminal-reflowjs';
 *
 * const wrapped = wrap.wrapString("Hello World!", 7);
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

import stringWidth from "string-width";
import { ANSI_MARKER, isTerminator } from "./ansi";

/**
 * Options for hard wrapping.
 * @public
 */
export interface WrapOptions {
  /** The maximum width for wrapped lines */
  limit?: number;
  /** Output newline sequence */
  newline?: string;
  /** Whether to preserve existing newlines (default: true) */
  keepNewlines?: boolean;
  /** Whether to preserve leading space after wrap (default: false) */
  preserveSpace?: boolean;
  /** Width of tab characters (default: 4) */
  tabWidth?: number;
}

/**
 * Hard-wrap writer that wraps text at exact character limits.
 * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go
 * @public
 */
export class Writer {
  /** Maximum width per line (0 = unlimited) */
  limit: number;
  /** Output newline sequence */
  newline: string;
  /** Whether to preserve existing newlines */
  keepNewlines: boolean;
  /** Whether to preserve leading space after wrap */
  preserveSpace: boolean;
  /** Width of tab characters */
  tabWidth: number;

  private buf: string[] = [];
  private lineLen = 0;
  private ansi = false;

  constructor(options: WrapOptions = {}) {
    this.limit = options.limit ?? 80;
    this.newline = options.newline ?? "\n";
    this.keepNewlines = options.keepNewlines ?? true;
    this.preserveSpace = options.preserveSpace ?? false;
    this.tabWidth = options.tabWidth ?? 4;
  }

  /**
   * Write content to the hard wrapper.
   */
  write(s: string): void {
    // Determine newline characters to recognize in input
    const newlineChars = new Set(["\n", "\r"]);
    // Also recognize chars from the output newline string
    for (const c of this.newline) {
      newlineChars.add(c);
    }

    for (const c of s) {
      if (c === ANSI_MARKER) {
        // Start of ANSI escape sequence
        this.buf.push(c);
        this.ansi = true;
        continue;
      }

      if (this.ansi) {
        this.buf.push(c);
        if (isTerminator(c)) {
          this.ansi = false;
        }
        continue;
      }

      // Check if this character is a newline
      if (newlineChars.has(c)) {
        if (this.keepNewlines) {
          this.buf.push(this.newline);
          this.lineLen = 0;
        }
        continue;
      }

      // Handle tabs - expand to spaces
      if (c === "\t" && this.tabWidth > 0) {
        // Calculate how many spaces the tab represents (up to tabWidth)
        const spacesToAdd = this.tabWidth;
        let remaining = spacesToAdd;

        while (remaining > 0) {
          // Check if we need to wrap before adding this space
          if (this.limit > 0 && this.lineLen >= this.limit) {
            this.buf.push(this.newline);
            this.lineLen = 0;

            if (!this.preserveSpace) {
              // Skip remaining spaces from the tab
              break;
            }
          }

          this.buf.push(" ");
          this.lineLen += 1;
          remaining -= 1;
        }
        continue;
      }

      const charWidth = stringWidth(c);

      // Check if we would exceed limit
      if (this.limit > 0 && this.lineLen + charWidth > this.limit) {
        // Need to wrap
        this.buf.push(this.newline);
        this.lineLen = 0;

        // Skip leading space if preserveSpace is false
        if (!this.preserveSpace && c === " ") {
          continue;
        }
      }

      // Write the character
      this.buf.push(c);
      this.lineLen += charWidth;
    }
  }

  /**
   * Get the wrapped result as a string.
   */
  toString(): string {
    return this.buf.join("");
  }
}

/**
 * Creates a new hard-wrap writer with the specified limit.
 *
 * @param limit - The maximum width for wrapped lines
 * @returns A new Writer instance
 * @public
 */
export function newWriter(limit: number): Writer {
  return new Writer({ limit });
}

/**
 * Hard-wraps a string to the specified width.
 *
 * This is a convenience function that wraps text at exact character
 * boundaries, regardless of word breaks.
 *
 * @param s - The string to wrap
 * @param limit - The exact width for lines
 * @param options - Additional options
 * @returns The wrapped text
 *
 * @example
 * ```ts
 * const result = wrapString("Hello World!", 7);
 * console.log(result);
 * // Hello W
 * // orld!
 * ```
 *
 * @public
 */
export function wrapString(s: string, limit: number, options: Omit<WrapOptions, "limit"> = {}): string {
  const w = new Writer({ ...options, limit });
  w.write(s);
  return w.toString();
}

/**
 * Alias for wrapString for backwards compatibility.
 * @public
 */
export function wrap(s: string, limit: number): string {
  return wrapString(s, limit);
}

/**
 * Hard-wraps a buffer to the specified width.
 *
 * @param b - The buffer to wrap
 * @param limit - The maximum width for lines
 * @returns The wrapped buffer
 * @public
 */
export function wrapBytes(b: Buffer, limit: number): Buffer {
  const result = wrapString(b.toString("utf8"), limit);
  return Buffer.from(result, "utf8");
}
