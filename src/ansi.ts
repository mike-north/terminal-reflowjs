/**
 * ANSI escape sequence handling utilities.
 * Ported from: https://github.com/muesli/reflow/tree/master/ansi
 *
 * @packageDocumentation
 */

/**
 * ANSI escape sequence marker character
 * @public
 */
export const MARKER = '\x1B';

/**
 * Check if a character is an ANSI sequence terminator.
 * Terminators are characters in the ranges A-Z (0x40-0x5a) and a-z (0x61-0x7a).
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go
 * @public
 */
export function isTerminator(c: string): boolean {
  const code = c.charCodeAt(0);
  return (code >= 0x40 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

/**
 * Writer that tracks ANSI escape sequences and allows resetting/restoring them.
 * This is crucial for maintaining color/style state when adding indentation.
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/writer.go
 * @public
 */
export class Writer {
  /** The underlying writer to forward output to */
  forward: { write: (data: string) => void };
  
  private ansi = false;
  private ansiseq = '';
  private lastseq = '';
  private seqchanged = false;

  constructor(forward: { write: (data: string) => void }) {
    this.forward = forward;
  }

  /**
   * Write content to the ANSI buffer.
   * Tracks ANSI sequences and forwards processed output.
   */
  write(data: string): void {
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      
      if (c === MARKER) {
        // ANSI escape sequence start
        this.ansi = true;
        this.seqchanged = true;
        this.ansiseq += c;
      } else if (this.ansi) {
        this.ansiseq += c;
        if (isTerminator(c)) {
          // ANSI sequence terminated
          this.ansi = false;

          if (this.ansiseq.endsWith('[0m')) {
            // reset sequence
            this.lastseq = '';
            this.seqchanged = false;
          } else if (c === 'm') {
            // color code - save it
            this.lastseq = this.ansiseq;
          }

          this.forward.write(this.ansiseq);
          this.ansiseq = '';
        }
      } else {
        this.forward.write(c);
      }
    }
  }

  /**
   * Get the last ANSI sequence that was written
   */
  lastSequence(): string {
    return this.lastseq;
  }

  /**
   * Write an ANSI reset sequence if there have been changes
   */
  resetAnsi(): void {
    if (!this.seqchanged) {
      return;
    }
    this.forward.write('\x1b[0m');
  }

  /**
   * Restore the last ANSI sequence
   */
  restoreAnsi(): void {
    this.forward.write(this.lastseq);
  }
}
