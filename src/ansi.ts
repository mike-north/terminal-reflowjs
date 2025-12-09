/**
 * ANSI escape sequence utilities.
 *
 * Provides helpers for detecting, parsing, and handling ANSI escape sequences
 * while calculating visible string widths.
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";

/**
 * ANSI escape sequence marker character (ESC = 0x1B).
 * @public
 */
export const ANSI_MARKER = "\x1B";

/**
 * ANSI reset sequence to clear all formatting.
 * @public
 */
export const ANSI_RESET = "\x1b[0m";

/**
 * Check if a character is an ANSI sequence terminator.
 * Terminators are characters in the ranges A-Z (0x40-0x5a) and a-z (0x61-0x7a).
 *
 * @param c - Single character to check
 * @returns True if the character terminates an ANSI sequence
 * @public
 */
export function isAnsiTerminator(c: string): boolean {
  const code = c.charCodeAt(0);
  return (code >= 0x40 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

/**
 * Calculate the visible (printable) width of a string, ignoring ANSI escape sequences.
 * Correctly handles East Asian wide characters.
 *
 * @param str - String to measure
 * @returns The visible width in terminal columns
 * @public
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
 * Strip all ANSI escape sequences from a string.
 *
 * @param str - String potentially containing ANSI sequences
 * @returns String with all ANSI sequences removed
 * @public
 */
export function stripAnsi(str: string): string {
  let result = "";
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

    result += ch;
  }

  return result;
}

/**
 * ANSI-aware string buffer that tracks the last styling sequence written.
 * Useful for building strings while maintaining ANSI state.
 *
 * @public
 */
export class AnsiBuffer {
  private output: string[] = [];
  private ansiSeq: string[] = [];
  private lastSeq: string[] = [];
  private inAnsi = false;
  private seqChanged = false;

  /**
   * Write content to the buffer.
   */
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

  /**
   * Get the last ANSI style sequence that was written.
   */
  getLastSequence(): string {
    return this.lastSeq.join("");
  }

  /**
   * Write an ANSI reset sequence if styling has changed.
   */
  resetAnsi(): void {
    if (!this.seqChanged) return;
    this.output.push(ANSI_RESET);
  }

  /**
   * Get the buffer contents as a string.
   */
  toString(): string {
    return this.output.join("");
  }
}

/**
 * ANSI-aware forwarding writer that tracks escape sequences.
 * Useful for transforming text while preserving ANSI styling.
 *
 * @public
 */
export class AnsiPassthrough {
  private forward: { write: (data: string) => void };
  private ansi = false;
  private ansiseq = "";
  private lastseq = "";
  private seqchanged = false;

  constructor(forward: { write: (data: string) => void }) {
    this.forward = forward;
  }

  /**
   * Write content, tracking ANSI sequences and forwarding output.
   */
  write(data: string): void {
    for (const c of data) {
      if (c === ANSI_MARKER) {
        this.ansi = true;
        this.seqchanged = true;
        this.ansiseq += c;
      } else if (this.ansi) {
        this.ansiseq += c;
        if (isAnsiTerminator(c)) {
          this.ansi = false;

          if (this.ansiseq.endsWith("[0m")) {
            this.lastseq = "";
            this.seqchanged = false;
          } else if (c === "m") {
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
   * Get the last ANSI style sequence that was written.
   */
  getLastSequence(): string {
    return this.lastseq;
  }

  /**
   * Write an ANSI reset sequence if styling has changed.
   */
  resetAnsi(): void {
    if (!this.seqchanged) return;
    this.forward.write(ANSI_RESET);
  }

  /**
   * Restore the last ANSI style sequence.
   */
  restoreAnsi(): void {
    this.forward.write(this.lastseq);
  }
}

