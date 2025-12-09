/**
 * Wrap module for unconditional (hard) text wrapping
 * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go
 * 
 * This module performs unconditional wrapping of text, which means it wraps
 * strictly at the specified width regardless of word boundaries. It preserves
 * ANSI escape sequences correctly by not counting them toward the line width.
 *
 * @packageDocumentation
 */

import { Marker, isTerminator, printableRuneWidth, runeWidth } from "./ansi";

/**
 * Default configuration values
 */
const defaultNewline = "\n";
const defaultTabWidth = 4;

/**
 * Options for configuring the wrap behavior
 * @public
 */
export interface WrapOptions {
  /**
   * Maximum line width (number of printable characters)
   */
  limit: number;

  /**
   * Newline character(s) to use when wrapping
   * @defaultValue The newline character (LF)
   */
  newline?: string;

  /**
   * Whether to preserve existing newlines in the input
   * If false, newlines are removed and the text is reflowed
   * Default: true
   */
  keepNewlines?: boolean;

  /**
   * Whether to preserve leading spaces after a forced line break
   * If false, leading whitespace after a forced wrap is trimmed
   * Default: false
   */
  preserveSpace?: boolean;

  /**
   * Width of tab characters in spaces
   * Default: 4
   */
  tabWidth?: number;
}

/**
 * Writer class for wrapping text with ANSI escape sequence awareness
 * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go#L17-L28
 * @public
 */
export class Writer {
  /**
   * Maximum line width
   */
  public limit: number;

  /**
   * Newline character(s) to insert when wrapping
   */
  public newline: string;

  /**
   * Whether to keep existing newlines
   */
  public keepNewlines: boolean;

  /**
   * Whether to preserve spaces after forced line breaks
   */
  public preserveSpace: boolean;

  /**
   * Tab width in spaces
   */
  public tabWidth: number;

  private buf: string;
  private lineLen: number;
  private ansi: boolean;
  private forcefulNewline: boolean;

  constructor(options: WrapOptions) {
    this.limit = options.limit;
    this.newline = options.newline ?? defaultNewline;
    this.keepNewlines = options.keepNewlines ?? true;
    this.preserveSpace = options.preserveSpace ?? false;
    this.tabWidth = options.tabWidth ?? defaultTabWidth;

    this.buf = "";
    this.lineLen = 0;
    this.ansi = false;
    this.forcefulNewline = false;
  }

  /**
   * Add a newline to the buffer
   */
  private addNewLine(): void {
    this.buf += this.newline;
    this.lineLen = 0;
  }

  /**
   * Write text to the buffer with wrapping
   * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go#L68-L119
   */
  public write(text: string | Buffer): void {
    // Convert Buffer to string if needed
    let s = typeof text === "string" ? text : text.toString("utf-8");

    // Replace tabs with spaces
    s = s.replace(/\t/g, " ".repeat(this.tabWidth));

    // Optionally remove newlines
    if (!this.keepNewlines) {
      s = s.replace(/\n/g, "");
    }

    const width = printableRuneWidth(s);

    // If no limit or content fits on current line, just append
    if (this.limit <= 0 || this.lineLen + width <= this.limit) {
      this.lineLen += width;
      this.buf += s;
      return;
    }

    // Process character by character for wrapping
    // Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go#L82-L116
    for (const char of s) {
      if (char === Marker) {
        // Start of ANSI escape sequence
        this.ansi = true;
      } else if (this.ansi) {
        // Inside ANSI escape sequence
        if (isTerminator(char)) {
          this.ansi = false;
        }
      } else if (this.isNewline(char)) {
        // Newline character in input
        this.addNewLine();
        this.forcefulNewline = false;
        continue;
      } else {
        // Regular printable character
        const charWidth = runeWidth(char);

        // Check if we need to wrap
        if (this.lineLen + charWidth > this.limit) {
          this.addNewLine();
          this.forcefulNewline = true;
        }

        // Skip leading space after forced wrap if preserveSpace is false
        if (this.lineLen === 0) {
          if (this.forcefulNewline && !this.preserveSpace && this.isSpace(char)) {
            continue;
          }
        } else {
          this.forcefulNewline = false;
        }

        this.lineLen += charWidth;
      }

      this.buf += char;
    }
  }

  /**
   * Check if a character is a newline
   * Checks if the character matches any character in the newline string
   */
  private isNewline(char: string): boolean {
    // Check each character in the newline string
    for (const nl of this.newline) {
      if (char === nl) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a character is whitespace
   */
  private isSpace(char: string): boolean {
    return /\s/.test(char);
  }

  /**
   * Get the wrapped result as a Buffer
   */
  public bytes(): Buffer {
    return Buffer.from(this.buf, "utf-8");
  }

  /**
   * Get the wrapped result as a string
   */
  public toString(): string {
    return this.buf;
  }
}

/**
 * Shorthand function to wrap a string
 * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go#L63-L66
 * 
 * @param text - The text to wrap
 * @param limit - Maximum line width
 * @param options - Optional wrapping configuration
 * @returns Wrapped text
 * @public
 */
export function wrapString(
  text: string,
  limit: number,
  options?: Partial<Omit<WrapOptions, "limit">>
): string {
  const writer = new Writer({ limit, ...options });
  writer.write(text);
  return writer.toString();
}

/**
 * Shorthand function to wrap bytes
 * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap.go#L52-L58
 * 
 * @param data - The data to wrap
 * @param limit - Maximum line width
 * @param options - Optional wrapping configuration
 * @returns Wrapped data as Buffer
 * @public
 */
export function wrapBytes(
  data: Buffer,
  limit: number,
  options?: Partial<Omit<WrapOptions, "limit">>
): Buffer {
  const writer = new Writer({ limit, ...options });
  writer.write(data);
  return writer.bytes();
}
