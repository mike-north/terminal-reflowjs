/**
 * ANSI utility module for handling ANSI escape sequences in terminal text.
 * Port of Go's github.com/muesli/reflow/ansi package.
 *
 * @packageDocumentation
 */

import stringWidth from 'string-width';

/**
 * ANSI escape sequence marker character (ESC)
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go
 * @public
 */
export const ANSI_MARKER = '\x1B';

/**
 * ANSI reset sequence to clear all formatting
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/writer.go
 */
export const ANSI_RESET = '\x1b[0m';

/**
 * Checks if a character is an ANSI sequence terminator.
 * ANSI sequences are terminated by characters in the ranges 0x40-0x5a and 0x61-0x7a.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go
 * The terminator check matches the Go implementation's IsTerminator function.
 * 
 * @param char - The character to check
 * @returns true if the character terminates an ANSI sequence
 * @public
 */
export function isAnsiTerminator(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 0x40 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

/**
 * Calculates the printable width of a string, ignoring ANSI escape sequences.
 * This uses string-width for accurate East Asian width calculations.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/buffer.go
 * The Go implementation uses github.com/mattn/go-runewidth for width calculation.
 * 
 * @param str - The string to measure
 * @returns The visual width in terminal columns
 * @public
 */
export function printableRuneWidth(str: string): number {
  let result = '';
  let inAnsi = false;
  
  for (const char of str) {
    if (char === ANSI_MARKER) {
      inAnsi = true;
    } else if (inAnsi) {
      if (isAnsiTerminator(char)) {
        inAnsi = false;
      }
    } else {
      result += char;
    }
  }
  
  return stringWidth(result);
}

/**
 * Writer class that tracks ANSI sequences while writing to an output buffer.
 * This is used by the truncate module to preserve ANSI styling.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/writer.go
 * The Go implementation uses a more complex io.Writer interface pattern.
 * @public
 */
export class AnsiWriter {
  private output: string[] = [];
  private ansiSeq: string[] = [];
  private lastSeq: string[] = [];
  private inAnsi = false;
  private seqChanged = false;

  /**
   * Writes a string, tracking ANSI sequences.
   * 
   * Reference: https://github.com/muesli/reflow/blob/master/ansi/writer.go
   * The Go version's Write method handles ANSI sequences and tracks the last styling sequence.
   * 
   * @param str - The string to write
   */
  write(str: string): void {
    for (const char of str) {
      if (char === ANSI_MARKER) {
        this.inAnsi = true;
        this.seqChanged = true;
        this.ansiSeq.push(char);
      } else if (this.inAnsi) {
        this.ansiSeq.push(char);
        if (isAnsiTerminator(char)) {
          this.inAnsi = false;
          
          const seqStr = this.ansiSeq.join('');
          
          // Check for reset sequence
          if (seqStr === ANSI_RESET) {
            this.lastSeq = [];
            this.seqChanged = false;
          } else if (char === 'm') {
            // Color code - track it
            this.lastSeq = [...this.ansiSeq];
          }
          
          this.output.push(seqStr);
          this.ansiSeq = [];
        }
      } else {
        this.output.push(char);
      }
    }
  }

  /**
   * Gets the last ANSI styling sequence.
   * 
   * @returns The last ANSI sequence as a string
   */
  getLastSequence(): string {
    return this.lastSeq.join('');
  }

  /**
   * Adds a reset ANSI sequence to the output if needed.
   * This is called when truncation happens in the middle of styled text.
   * 
   * Reference: https://github.com/muesli/reflow/blob/master/ansi/writer.go
   * The Go version's ResetAnsi method adds ANSI reset when sequences have changed.
   */
  resetAnsi(): void {
    if (!this.seqChanged) {
      return;
    }
    this.output.push(ANSI_RESET);
  }

  /**
   * Gets the accumulated output as a string.
   * 
   * @returns The output string
   */
  toString(): string {
    return this.output.join('');
  }
}
