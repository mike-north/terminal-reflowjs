import stringWidth from "string-width";

/**
 * ANSI escape sequence marker character (ESC).
 * @public
 */
export const ANSI_MARKER = "\x1B";

/**
 * ANSI reset sequence to clear formatting.
 * @public
 */
export const ANSI_RESET = "\x1b[0m";

/**
 * Check if a character is an ANSI sequence terminator.
 * Terminators are characters in the ranges A-Z (0x40-0x5a) and a-z (0x61-0x7a).
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go
 * @public
 */
export function isAnsiTerminator(c: string): boolean {
  const code = c.charCodeAt(0);
  return (code >= 0x40 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

/**
 * Alias for isAnsiTerminator retained for compatibility with indent module.
 * @public
 */
export function isTerminator(c: string): boolean {
  return isAnsiTerminator(c);
}

/**
 * Calculate printable width of a string, ignoring ANSI escape sequences.
 * Mirrors the Go implementation's behavior using string-width for
 * correct East Asian width handling.
 */
export function printableRuneWidth(str: string): number {
  let visible = "";
  let inAnsi = false;

  for (const ch of str) {
    if (ch === ANSI_MARKER) {
      inAnsi = true;
      continue;
    }

    if (inAnsi) {
      if (isAnsiTerminator(ch)) {
        inAnsi = false;
      }
      continue;
    }

    visible += ch;
  }

  return stringWidth(visible);
}

/**
 * ANSI-aware writer that buffers output and keeps track of the last styling
 * sequence written. This mirrors the behavior of the Go implementation's
 * ansi.Writer used by truncate/margin/wrap.
 */
export class AnsiWriter {
  private output: string[] = [];
  private ansiSeq: string[] = [];
  private lastSeq: string[] = [];
  private inAnsi = false;
  private seqChanged = false;

  write(str: string): void {
    for (const ch of str) {
      if (ch === ANSI_MARKER) {
        this.inAnsi = true;
        this.seqChanged = true;
        this.ansiSeq.push(ch);
        continue;
      }

      if (this.inAnsi) {
        this.ansiSeq.push(ch);
        if (isAnsiTerminator(ch)) {
          this.inAnsi = false;
          const seq = this.ansiSeq.join("");

          if (seq === ANSI_RESET) {
            this.lastSeq = [];
            this.seqChanged = false;
          } else if (ch === "m") {
            this.lastSeq = [...this.ansiSeq];
          }

          this.output.push(seq);
          this.ansiSeq = [];
        }
        continue;
      }

      this.output.push(ch);
    }
  }

  getLastSequence(): string {
    return this.lastSeq.join("");
  }

  resetAnsi(): void {
    if (!this.seqChanged) return;
    this.output.push(ANSI_RESET);
  }

  toString(): string {
    return this.output.join("");
  }
}

/**
 * Writer that tracks ANSI escape sequences and allows resetting/restoring them.
 * This is crucial for maintaining color/style state when adding indentation.
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/writer.go
 * @public
 */
export class WriterBase {
  /** The underlying writer to forward output to */
  forward: { write: (data: string) => void };

  private ansi = false;
  private ansiseq = "";
  private lastseq = "";
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

      if (c === ANSI_MARKER) {
        // ANSI escape sequence start
        this.ansi = true;
        this.seqchanged = true;
        this.ansiseq += c;
      } else if (this.ansi) {
        this.ansiseq += c;
        if (isTerminator(c)) {
          // ANSI sequence terminated
          this.ansi = false;

          if (this.ansiseq.endsWith("[0m")) {
            // reset sequence
            this.lastseq = "";
            this.seqchanged = false;
          } else if (c === "m") {
            // color code - save it
            this.lastseq = this.ansiseq;
          }

          this.forward.write(this.ansiseq);
          this.ansiseq = "";
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
    this.forward.write(ANSI_RESET);
  }

  /**
   * Restore the last ANSI sequence
   */
  restoreAnsi(): void {
    this.forward.write(this.lastseq);
  }
}
