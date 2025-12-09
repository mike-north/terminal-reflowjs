/**
 * Word-wrap text at a specified width.
 *
 * This module provides utilities for wrapping text at word boundaries,
 * ensuring that words are not broken across lines unless absolutely necessary.
 *
 * Ported from: https://github.com/muesli/reflow/tree/master/wordwrap
 *
 * @example
 * ```ts
 * import { wordwrap } from 'terminal-reflowjs';
 *
 * const wrapped = wordwrap.wrapString("Hello World!", 5);
 * // Result:
 * // Hello
 * // World!
 * ```
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";
import { ANSI_MARKER, isTerminator } from "./ansi";

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
 * Word-wrap writer that wraps text at word boundaries.
 * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go
 * @public
 */
export class WordWrap {
  /** Maximum width per line (0 = unlimited) */
  limit: number;
  /** Characters considered breakpoints */
  breakpoints: string[];
  /** Characters treated as explicit newlines */
  newline: string[];
  /** Whether to preserve explicit newlines */
  keepNewlines: boolean;

  private buf: string[] = [];
  private lineLen = 0;
  private ansi = false;
  private space: string[] = [];  // Buffer for whitespace (spaces/tabs only)
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
        // Start of ANSI escape sequence - add to current word
        this.word.push(c);
        this.ansi = true;
        continue;
      }

      if (this.ansi) {
        this.word.push(c);
        if (isTerminator(c)) {
          this.ansi = false;
        }
        continue;
      }

      if (this.newline.includes(c)) {
        // Newline character
        if (this.keepNewlines) {
          // Flush word (space will be handled)
          this.flushWordAndSpace();
          // Always output standard newline, regardless of which newline char was matched
          this.buf.push("\n");
          this.lineLen = 0;
        } else {
          // Treat newline as a space when keepNewlines is false
          // First flush any pending word
          this.flushWordOnly();
          // Add space to buffer (like a regular space breakpoint)
          if (this.space.length === 0 || this.space[this.space.length - 1] !== " ") {
            this.space.push(" ");
          }
        }
        continue;
      }

      if (this.breakpoints.includes(c)) {
        // Breakpoint character (space, hyphen, etc.)
        // First flush any pending word
        this.flushWordOnly();
        
        // Handle the breakpoint character
        if (c === " " || c === "\t") {
          // Whitespace breakpoint - add to space buffer
          this.space.push(c);
        } else {
          // Non-whitespace breakpoint (like hyphen, comma)
          // First add any pending spaces
          if (this.space.length > 0) {
            const spaceStr = this.space.join("");
            const spaceWidth = stringWidth(spaceStr);
            if (this.limit === 0 || this.lineLen + spaceWidth <= this.limit) {
              this.buf.push(spaceStr);
              this.lineLen += spaceWidth;
            }
            this.space = [];
          }
          // Then add the breakpoint character to the current line
          const charWidth = stringWidth(c);
          if (this.limit === 0 || this.lineLen + charWidth <= this.limit) {
            this.buf.push(c);
            this.lineLen += charWidth;
          }
          // Start collecting spaces for potential line break
        }
        continue;
      }

      // Regular character - add to word
      this.word.push(c);
      this.wordLen += stringWidth(c);
    }
  }

  /**
   * Close the writer (flushes remaining content).
   */
  close(): void {
    this.flushWordAndSpace();
    
    // When keepNewlines is false, strip trailing whitespace
    if (!this.keepNewlines) {
      // Remove trailing whitespace from buffer
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

  /**
   * Flush only the word, potentially adding space first.
   * Used when we encounter another breakpoint.
   */
  private flushWordOnly(): void {
    if (this.word.length === 0) {
      return;
    }

    const spaceStr = this.space.join("");
    const spaceWidth = stringWidth(spaceStr);

    // Check if word + space would fit on current line
    if (this.limit > 0 && this.lineLen > 0) {
      if (this.lineLen + spaceWidth + this.wordLen > this.limit) {
        // Word doesn't fit - break line and drop the space
        this.buf.push("\n");
        this.lineLen = 0;
        this.space = [];
      } else {
        // Word fits - add space first
        if (spaceWidth > 0) {
          this.buf.push(spaceStr);
          this.lineLen += spaceWidth;
        }
        this.space = [];
      }
    } else if (this.lineLen === 0) {
      // At start of line - drop whitespace spaces, but keep if keeping newlines off
      if (!this.keepNewlines) {
        this.space = [];
      } else {
        // Keep leading space/tab after newline
        if (spaceWidth > 0 && (this.limit === 0 || spaceWidth <= this.limit)) {
          this.buf.push(spaceStr);
          this.lineLen += spaceWidth;
        }
        this.space = [];
      }
    } else {
      // No limit - just add space
      if (spaceWidth > 0) {
        this.buf.push(spaceStr);
        this.lineLen += spaceWidth;
      }
      this.space = [];
    }

    // Add the word
    const wordStr = this.word.join("");
    this.buf.push(wordStr);
    this.lineLen += this.wordLen;

    this.word = [];
    this.wordLen = 0;
  }

  /**
   * Flush word and any remaining space.
   * Used at end of input or before newline.
   */
  private flushWordAndSpace(): void {
    if (this.word.length > 0) {
      this.flushWordOnly();
    }
    
    // Handle any trailing space
    if (this.space.length > 0) {
      const spaceStr = this.space.join("");
      const spaceWidth = stringWidth(spaceStr);
      
      // Only add trailing space if it fits
      if (this.limit === 0 || this.lineLen + spaceWidth <= this.limit) {
        this.buf.push(spaceStr);
        this.lineLen += spaceWidth;
      }
      this.space = [];
    }
  }
}

/**
 * Creates a new WordWrap writer with the specified limit.
 *
 * @param limit - The maximum width for wrapped lines
 * @param options - Additional options
 * @returns A new WordWrap instance
 * @public
 */
export function newWriter(limit: number, options: WordWrapOptions = {}): WordWrap {
  return new WordWrap(limit, options);
}

/**
 * Word-wraps a string to the specified width.
 *
 * This is a convenience function that wraps text at word boundaries.
 * Words will not be broken unless they exceed the limit.
 *
 * @param s - The string to wrap
 * @param limit - The maximum width for lines
 * @returns The wrapped text
 *
 * @example
 * ```ts
 * const result = wrapString("Hello World!", 5);
 * console.log(result);
 * // Hello
 * // World!
 * ```
 *
 * @public
 */
export function wrapString(s: string, limit: number): string {
  const w = new WordWrap(limit);
  w.write(s);
  w.close();
  return w.toString();
}

/**
 * Alias for wrapString for backwards compatibility.
 * @public
 */
export function wordwrap(s: string, limit: number): string {
  return wrapString(s, limit);
}

/**
 * Word-wraps a buffer to the specified width.
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
