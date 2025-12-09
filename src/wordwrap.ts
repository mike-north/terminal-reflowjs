/**
 * Word-wrap text at word boundaries.
 *
 * Wraps text at spaces, hyphens, or other configurable breakpoints,
 * keeping words intact unless they exceed the line width.
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";
import { ANSI_MARKER, isAnsiTerminator } from "./ansi";

/**
 * Options for word wrapping.
 * @public
 */
export interface WordWrapOptions {
  /** Characters that can be used as breakpoints (default: space, hyphen) */
  breakpoints?: string[];
  /** Characters that represent newlines (default: \n) */
  newline?: string[];
  /** Whether to preserve explicit newlines (default: true) */
  keepNewlines?: boolean;
}

const DEFAULT_BREAKPOINTS = [" ", "-"];
const DEFAULT_NEWLINES = ["\n"];

/**
 * Word-wrap writer for streaming text processing.
 *
 * Wraps text at word boundaries (spaces, hyphens) while preserving
 * ANSI escape sequences. Words are never broken unless they exceed
 * the line width.
 *
 * @example
 * ```ts
 * const writer = new WordWrapWriter(40);
 * writer.write("This is a long sentence that needs wrapping.");
 * writer.close();
 * console.log(writer.toString());
 * ```
 *
 * @public
 */
export class WordWrapWriter {
  /** Maximum width per line (0 = unlimited) */
  readonly limit: number;
  /** Characters considered breakpoints */
  readonly breakpoints: string[];
  /** Characters treated as explicit newlines */
  readonly newline: string[];
  /** Whether to preserve explicit newlines */
  readonly keepNewlines: boolean;

  private buf: string[] = [];
  private lineLen = 0;
  private ansi = false;
  private space: string[] = [];
  private word: string[] = [];
  private wordLen = 0;

  constructor(limit: number, options: WordWrapOptions = {}) {
    this.limit = limit;
    this.breakpoints = options.breakpoints ?? DEFAULT_BREAKPOINTS;
    this.newline = options.newline ?? DEFAULT_NEWLINES;
    this.keepNewlines = options.keepNewlines ?? true;
  }

  /**
   * Write content to the word wrapper.
   */
  write(s: string): void {
    for (const c of s) {
      if (c === ANSI_MARKER) {
        this.word.push(c);
        this.ansi = true;
        continue;
      }

      if (this.ansi) {
        this.word.push(c);
        if (isAnsiTerminator(c)) {
          this.ansi = false;
        }
        continue;
      }

      if (this.newline.includes(c)) {
        if (this.keepNewlines) {
          this.flushWordAndSpace();
          this.buf.push("\n");
          this.lineLen = 0;
        } else {
          this.flushWordOnly();
          if (
            this.space.length === 0 ||
            this.space[this.space.length - 1] !== " "
          ) {
            this.space.push(" ");
          }
        }
        continue;
      }

      if (this.breakpoints.includes(c)) {
        this.flushWordOnly();

        if (c === " " || c === "\t") {
          this.space.push(c);
        } else {
          if (this.space.length > 0) {
            const spaceStr = this.space.join("");
            const spaceWidth = stringWidth(spaceStr);
            if (this.limit === 0 || this.lineLen + spaceWidth <= this.limit) {
              this.buf.push(spaceStr);
              this.lineLen += spaceWidth;
            }
            this.space = [];
          }
          const charWidth = stringWidth(c);
          if (this.limit === 0 || this.lineLen + charWidth <= this.limit) {
            this.buf.push(c);
            this.lineLen += charWidth;
          }
        }
        continue;
      }

      this.word.push(c);
      this.wordLen += stringWidth(c);
    }
  }

  /**
   * Finalize the writer, flushing any remaining content.
   */
  close(): void {
    this.flushWordAndSpace();

    if (!this.keepNewlines) {
      while (this.buf.length > 0) {
        const last = this.buf[this.buf.length - 1];
        if (last === " " || last === "\t") {
          this.buf.pop();
        } else {
          break;
        }
      }
    }
  }

  /**
   * Get the wrapped result as a string.
   */
  toString(): string {
    return this.buf.join("");
  }

  private flushWordOnly(): void {
    if (this.word.length === 0) return;

    const spaceStr = this.space.join("");
    const spaceWidth = stringWidth(spaceStr);

    if (this.limit > 0 && this.lineLen > 0) {
      if (this.lineLen + spaceWidth + this.wordLen > this.limit) {
        this.buf.push("\n");
        this.lineLen = 0;
        this.space = [];
      } else {
        if (spaceWidth > 0) {
          this.buf.push(spaceStr);
          this.lineLen += spaceWidth;
        }
        this.space = [];
      }
    } else if (this.lineLen === 0) {
      if (!this.keepNewlines) {
        this.space = [];
      } else {
        if (spaceWidth > 0 && (this.limit === 0 || spaceWidth <= this.limit)) {
          this.buf.push(spaceStr);
          this.lineLen += spaceWidth;
        }
        this.space = [];
      }
    } else {
      if (spaceWidth > 0) {
        this.buf.push(spaceStr);
        this.lineLen += spaceWidth;
      }
      this.space = [];
    }

    const wordStr = this.word.join("");
    this.buf.push(wordStr);
    this.lineLen += this.wordLen;

    this.word = [];
    this.wordLen = 0;
  }

  private flushWordAndSpace(): void {
    if (this.word.length > 0) {
      this.flushWordOnly();
    }

    if (this.space.length > 0) {
      const spaceStr = this.space.join("");
      const spaceWidth = stringWidth(spaceStr);

      if (this.limit === 0 || this.lineLen + spaceWidth <= this.limit) {
        this.buf.push(spaceStr);
        this.lineLen += spaceWidth;
      }
      this.space = [];
    }
  }
}

/**
 * Word-wrap a string to the specified width.
 *
 * Wraps text at word boundaries (spaces, hyphens), keeping words intact.
 * This is the recommended function for most use cases.
 *
 * @param s - The string to wrap
 * @param limit - Maximum line width
 * @param options - Additional options
 * @returns The wrapped string
 *
 * @example
 * ```ts
 * const wrapped = wordwrap("Hello World, this is a test!", 10);
 * // "Hello\nWorld,\nthis is a\ntest!"
 * ```
 *
 * @public
 */
export function wordwrap(
  s: string,
  limit: number,
  options?: WordWrapOptions
): string {
  const w = new WordWrapWriter(limit, options);
  w.write(s);
  w.close();
  return w.toString();
}

