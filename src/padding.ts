/**
 * Padding module for padding text to a specified width while preserving ANSI codes.
 * Ported from https://github.com/muesli/reflow/tree/master/padding
 *
 * @packageDocumentation
 */

import stringWidth from 'string-width';

/**
 * PaddingFunc is a function that writes padding characters to a buffer.
 * It receives the number of padding units needed.
 * @public
 */
export type PaddingFunc = (count: number) => string;

/**
 * PaddingWriter is a writer that pads text to a specified width.
 * It preserves ANSI escape sequences and handles wide characters correctly.
 * @public
 */
export class PaddingWriter {
  private padding: number;
  private padFunc: PaddingFunc | null;
  private buf: string;
  private cache: string;
  private lineLen: number;
  private ansi: boolean;
  private readonly ansiPattern: RegExp;

  constructor(width: number, paddingFunc: PaddingFunc | null = null) {
    this.padding = width;
    this.padFunc = paddingFunc;
    this.buf = '';
    this.cache = '';
    this.lineLen = 0;
    this.ansi = false;
    this.ansiPattern = ansiRegex();
  }

  /**
   * Write content to the padding buffer.
   * @param content - The string to write
   * @returns The number of bytes written
   */
  write(content: string): number {
    const bytes = Buffer.from(content);
    
    for (const char of content) {
      if (char === '\x1B') {
        // ANSI escape sequence start
        // This simple detection matches the Go implementation behavior
        this.ansi = true;
      } else if (this.ansi) {
        // ANSI sequence terminated by a letter (A-Z or a-z)
        // This matches the Go implementation's check: (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)
        const code = char.charCodeAt(0);
        if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
          this.ansi = false;
        }
      } else {
        // Regular character - calculate its display width
        // Note: We calculate width character-by-character to match the Go implementation
        // and to correctly handle newlines mid-stream. This is necessary because we need
        // to know the exact width at the point where we encounter a newline.
        this.lineLen += stringWidth(char);

        if (char === '\n') {
          // End of current line - add padding BEFORE the newline, then reset
          this.padLine();
          this.lineLen = 0;
        }
      }

      // Write character to buffer
      this.buf += char;
    }

    return bytes.length;
  }

  /**
   * Pad the current line if needed.
   * Only pads if there's content on the line (lineLen > 0) and the line is shorter than the padding width.
   * This matches the Go implementation behavior where empty lines are not padded.
   */
  private padLine(): void {
    if (this.padding > 0 && this.lineLen > 0 && this.lineLen < this.padding) {
      const padAmount = this.padding - this.lineLen;
      if (this.padFunc !== null) {
        // Use custom padding function
        this.buf += this.padFunc(padAmount);
      } else {
        // Default to spaces
        this.buf += ' '.repeat(padAmount);
      }
    }
  }

  /**
   * Flush completes the padding operation and prepares the result.
   * Always call this before retrieving the final result.
   * @returns Error if any occurred during flushing
   */
  flush(): void {
    // If there's content without a trailing newline, pad it
    if (this.lineLen !== 0) {
      this.padLine();
    }

    // Move buffer to cache and reset
    this.cache = this.buf;
    this.buf = '';
    this.lineLen = 0;
    this.ansi = false;
  }

  /**
   * Close finishes the padding operation (alias for flush).
   */
  close(): void {
    this.flush();
  }

  /**
   * Get the padded result as a Buffer.
   */
  bytes(): Buffer {
    return Buffer.from(this.cache);
  }

  /**
   * Get the padded result as a string.
   */
  toString(): string {
    return this.cache;
  }
}

/**
 * Pad a byte buffer to the specified width.
 * This is a convenience function that creates a PaddingWriter, writes the content, and returns the result.
 * 
 * @param content - The buffer to pad
 * @param width - The desired width
 * @returns The padded buffer
 * @public
 */
export function bytes(content: Buffer, width: number): Buffer {
  const writer = new PaddingWriter(width, null);
  writer.write(content.toString());
  writer.flush();
  return writer.bytes();
}

/**
 * Pad a string to the specified width.
 * This is a convenience function that creates a PaddingWriter, writes the content, and returns the result.
 * 
 * @param content - The string to pad
 * @param width - The desired width
 * @returns The padded string
 * @public
 */
export function string(content: string, width: number): string {
  const writer = new PaddingWriter(width, null);
  writer.write(content);
  writer.flush();
  return writer.toString();
}
