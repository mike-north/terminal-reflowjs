/**
 * Hard-wrap text at exact character boundaries.
 *
 * Wraps text at exact character limits, breaking words if necessary.
 * Use this when you need strict width enforcement.
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";
import { ANSI_MARKER, isAnsiTerminator } from "./ansi";

/**
 * Options for hard wrapping.
 * @public
 */
export interface HardWrapOptions {
  /** Output newline sequence (default: `\n`) */
  newline?: string;
  /** Whether to preserve existing newlines (default: true) */
  keepNewlines?: boolean;
  /** Whether to preserve leading space after wrap (default: false) */
  preserveSpace?: boolean;
  /** Width of tab characters (default: 4) */
  tabWidth?: number;
}

/**
 * Hard-wrap writer for streaming text processing.
 *
 * Wraps text at exact character limits, breaking words if necessary.
 * Preserves ANSI escape sequences without counting them toward width.
 *
 * @example
 * ```ts
 * const writer = new HardWrapWriter(40);
 * writer.write("This will be wrapped at exactly 40 characters.");
 * console.log(writer.toString());
 * ```
 *
 * @public
 */
export class HardWrapWriter {
  /** Maximum width per line (0 = unlimited) */
  readonly limit: number;
  /** Output newline sequence */
  readonly newline: string;
  /** Whether to preserve existing newlines */
  readonly keepNewlines: boolean;
  /** Whether to preserve leading space after wrap */
  readonly preserveSpace: boolean;
  /** Width of tab characters */
  readonly tabWidth: number;

  private buf: string[] = [];
  private lineLen = 0;
  private ansi = false;

  constructor(limit: number, options: HardWrapOptions = {}) {
    this.limit = limit;
    this.newline = options.newline ?? "\n";
    this.keepNewlines = options.keepNewlines ?? true;
    this.preserveSpace = options.preserveSpace ?? false;
    this.tabWidth = options.tabWidth ?? 4;
  }

  /**
   * Write content to the hard wrapper.
   */
  write(s: string): void {
    const newlineChars = new Set(["\n", "\r"]);
    for (const c of this.newline) {
      newlineChars.add(c);
    }

    for (const c of s) {
      if (c === ANSI_MARKER) {
        this.buf.push(c);
        this.ansi = true;
        continue;
      }

      if (this.ansi) {
        this.buf.push(c);
        if (isAnsiTerminator(c)) {
          this.ansi = false;
        }
        continue;
      }

      if (newlineChars.has(c)) {
        if (this.keepNewlines) {
          this.buf.push(this.newline);
          this.lineLen = 0;
        }
        continue;
      }

      if (c === "\t" && this.tabWidth > 0) {
        let remaining = this.tabWidth;

        while (remaining > 0) {
          if (this.limit > 0 && this.lineLen >= this.limit) {
            this.buf.push(this.newline);
            this.lineLen = 0;

            if (!this.preserveSpace) {
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

      if (this.limit > 0 && this.lineLen + charWidth > this.limit) {
        this.buf.push(this.newline);
        this.lineLen = 0;

        if (!this.preserveSpace && c === " ") {
          continue;
        }
      }

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
 * Hard-wrap a string to the specified width.
 *
 * Wraps text at exact character boundaries, breaking words if necessary.
 * This is the recommended function for strict width enforcement.
 *
 * @param s - The string to wrap
 * @param limit - Maximum line width
 * @param options - Additional options
 * @returns The wrapped string
 *
 * @example
 * ```ts
 * const wrapped = hardwrap("HelloWorld", 4);
 * // "Hell\noWor\nld"
 * ```
 *
 * @public
 */
export function hardwrap(
  s: string,
  limit: number,
  options?: HardWrapOptions
): string {
  const w = new HardWrapWriter(limit, options);
  w.write(s);
  return w.toString();
}


