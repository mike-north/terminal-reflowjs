/**
 * Truncate module for cutting text to a specified width while preserving ANSI sequences.
 * Port of Go's github.com/muesli/reflow/truncate package.
 * 
 * Reference: https://github.com/muesli/reflow/tree/master/truncate
 *
 * @packageDocumentation
 */

import stringWidth from 'string-width';
import { ANSI_MARKER, isAnsiTerminator, printableRuneWidth, AnsiWriter } from './ansi';

/**
 * Writer class for truncating text to a specified width.
 * This provides a streaming interface for truncation.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate.go
 * The Go version uses io.Writer pattern; this TypeScript version adapts it for string handling.
 * @public
 */
export class TruncateWriter {
  private width: number;
  private tail: string;
  private ansiWriter: AnsiWriter;
  private inAnsi = false;

  /**
   * Creates a new TruncateWriter.
   * 
   * @param width - The maximum width in terminal columns
   * @param tail - Optional tail to append (e.g., "..." or "…")
   */
  constructor(width: number, tail = '') {
    this.width = width;
    this.tail = tail;
    this.ansiWriter = new AnsiWriter();
  }

  /**
   * Writes and truncates content at the given printable cell width,
   * leaving any ANSI sequences intact.
   * 
   * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate.go
   * The Go version's Write method is the core truncation logic:
   * - It accounts for the tail width upfront
   * - It iterates through runes, tracking ANSI sequences
   * - It truncates when visual width exceeds the limit
   * - It adds a reset sequence if truncation happens mid-style
   * 
   * @param content - The content to write and potentially truncate
   */
  write(content: string): void {
    const tailWidth = printableRuneWidth(this.tail);
    
    // If tail is wider than available width, just write the tail
    if (this.width < tailWidth) {
      this.ansiWriter.write(this.tail);
      return;
    }

    // Account for tail width
    const availableWidth = this.width - tailWidth;
    let currentWidth = 0;

    for (const char of content) {
      if (char === ANSI_MARKER) {
        // Start of ANSI escape sequence
        this.inAnsi = true;
      } else if (this.inAnsi) {
        if (isAnsiTerminator(char)) {
          // ANSI sequence terminated
          this.inAnsi = false;
        }
      } else {
        // Regular character - count its width
        currentWidth += stringWidth(char);
      }

      // Check if we've exceeded the width
      if (currentWidth > availableWidth) {
        this.ansiWriter.write(this.tail);
        
        // Add reset sequence if we're in the middle of styled text
        // Reference: The Go version checks if LastSequence() != "" before calling ResetAnsi()
        if (this.ansiWriter.getLastSequence() !== '') {
          this.ansiWriter.resetAnsi();
        }
        return;
      }

      // Write the character
      this.ansiWriter.write(char);
    }
  }

  /**
   * Returns the truncated result as a string.
   * 
   * @returns The truncated string
   */
  toString(): string {
    return this.ansiWriter.toString();
  }
}

/**
 * Truncates a string to the specified width in terminal columns.
 * This is a convenience function for common use cases.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate.go
 * The Go version's String function provides the same simple API.
 * 
 * @param str - The string to truncate
 * @param width - The maximum width in terminal columns
 * @returns The truncated string
 * 
 * @example
 * ```typescript
 * truncateString("Hello World", 5)  // Returns "Hello"
 * truncateString("\x1B[31mHello\x1B[0m World", 5)  // Returns "\x1B[31mHello\x1B[0m"
 * ```
 * @public
 */
export function truncateString(str: string, width: number): string {
  return truncateStringWithTail(str, width, '');
}

/**
 * Truncates a string to the specified width and appends a tail.
 * The tail is included in the width calculation.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate.go
 * The Go version's StringWithTail function provides the same functionality.
 * 
 * @param str - The string to truncate
 * @param width - The maximum width in terminal columns
 * @param tail - The tail to append (e.g., "..." or "…")
 * @returns The truncated string with tail
 * 
 * @example
 * ```typescript
 * truncateStringWithTail("Hello World", 8, "...")  // Returns "Hello..."
 * truncateStringWithTail("\x1B[31mHello World\x1B[0m", 8, "…")  // Returns "\x1B[31mHello W…\x1B[0m"
 * ```
 * @public
 */
export function truncateStringWithTail(str: string, width: number, tail: string): string {
  const writer = new TruncateWriter(width, tail);
  writer.write(str);
  return writer.toString();
}

/**
 * Truncates a Buffer to the specified width in terminal columns.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate.go
 * The Go version's Bytes function works with byte slices.
 * 
 * @param buffer - The Buffer to truncate
 * @param width - The maximum width in terminal columns
 * @returns The truncated Buffer
 * @public
 */
export function truncateBytes(buffer: Buffer, width: number): Buffer {
  return truncateBytesWithTail(buffer, width, Buffer.from(''));
}

/**
 * Truncates a Buffer to the specified width and appends a tail.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate.go
 * The Go version's BytesWithTail function works with byte slices.
 * 
 * @param buffer - The Buffer to truncate
 * @param width - The maximum width in terminal columns
 * @param tail - The tail Buffer to append
 * @returns The truncated Buffer with tail
 * @public
 */
export function truncateBytesWithTail(buffer: Buffer, width: number, tail: Buffer): Buffer {
  const str = buffer.toString('utf8');
  const tailStr = tail.toString('utf8');
  const result = truncateStringWithTail(str, width, tailStr);
  return Buffer.from(result, 'utf8');
}
