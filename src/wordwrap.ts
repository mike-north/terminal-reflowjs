/**
 * Word wrapping module with ANSI escape sequence support.
 * Based on https://github.com/muesli/reflow/tree/master/wordwrap
 *
 * @packageDocumentation
 */

import stringWidth from "string-width";

const defaultBreakpoints = ["-"];
const defaultNewline = ["\n"];

/**
 * ANSI-aware buffer that tracks both raw content and printable width
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/buffer.go
 */
class AnsiBuffer {
  private buffer: string = "";

  /**
   * Append a string or character to the buffer
   */
  write(s: string): void {
    this.buffer += s;
  }

  reset(): void {
    this.buffer = "";
  }

  toString(): string {
    return this.buffer;
  }

  bytes(): Uint8Array {
    return new TextEncoder().encode(this.buffer);
  }

  len(): number {
    return this.buffer.length;
  }

  /**
   * Returns the printable width, excluding ANSI escape sequences
   * Reference: https://github.com/muesli/reflow/blob/master/ansi/buffer.go#L14-L18
   */
  printableRuneWidth(): number {
    return stringWidth(this.buffer);
  }
}

/**
 * Check if a character is an ANSI terminator
 * Reference: https://github.com/muesli/reflow/blob/master/ansi/ansi.go#L5-L7
 */
function isAnsiTerminator(c: string): boolean {
  const code = c.charCodeAt(0);
  return (code >= 0x40 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

/**
 * Check if a rune/character is in a group
 * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L81-L88
 */
function inGroup(group: string[], c: string): boolean {
  return group.includes(c);
}

/**
 * Check if a character is whitespace
 */
function isSpace(c: string): boolean {
  return /\s/.test(c);
}

/**
 * WordWrap contains settings and state for customizable text reflowing with
 * support for ANSI escape sequences. This means you can style your terminal
 * output without affecting the word wrapping algorithm.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L16-L31
 * @public
 */
export class WordWrap {
  limit: number;
  breakpoints: string[];
  newline: string[];
  keepNewlines: boolean;

  private buf: string = "";
  private space: string = "";
  private word: AnsiBuffer = new AnsiBuffer();
  private lineLen: number = 0;
  private ansi: boolean = false;

  constructor(limit: number) {
    this.limit = limit;
    this.breakpoints = defaultBreakpoints;
    this.newline = defaultNewline;
    this.keepNewlines = true;
  }

  /**
   * Add space buffer to output
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L60-L64
   */
  private addSpace(): void {
    this.lineLen += this.space.length;
    this.buf += this.space;
    this.space = "";
  }

  /**
   * Add word buffer to output
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L66-L73
   */
  private addWord(): void {
    if (this.word.len() > 0) {
      this.addSpace();
      this.lineLen += this.word.printableRuneWidth();
      this.buf += this.word.toString();
      this.word.reset();
    }
  }

  /**
   * Add newline and reset line length
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L75-L79
   */
  private addNewLine(): void {
    this.buf += "\n";
    this.lineLen = 0;
    this.space = "";
  }

  /**
   * Write content to the word-wrap buffer
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L90-L150
   */
  write(b: Uint8Array | string): number {
    const s = typeof b === "string" ? b : new TextDecoder().decode(b);

    if (this.limit === 0) {
      this.buf += s;
      return s.length;
    }

    let str = s;
    if (!this.keepNewlines) {
      // When keepNewlines is false, trim whitespace and replace newlines with spaces
      // Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L97-L99
      str = s.trim().replace(/\n/g, " ");
    }

    // Process each character
    for (const c of str) {
      if (c === "\x1B") {
        // ANSI escape sequence
        this.word.write(c);
        this.ansi = true;
      } else if (this.ansi) {
        this.word.write(c);
        if (isAnsiTerminator(c)) {
          // ANSI sequence terminated
          this.ansi = false;
        }
      } else if (inGroup(this.newline, c)) {
        // End of current line
        // See if we can add the content of the space buffer to the current line
        if (this.word.len() === 0) {
          if (this.lineLen + this.space.length > this.limit) {
            this.lineLen = 0;
          } else {
            // Preserve whitespace
            this.buf += this.space;
          }
          this.space = "";
        }

        this.addWord();
        this.addNewLine();
      } else if (isSpace(c)) {
        // End of current word
        this.addWord();
        this.space += c;
      } else if (inGroup(this.breakpoints, c)) {
        // Valid breakpoint
        this.addSpace();
        this.addWord();
        this.buf += c;
        this.lineLen++;
      } else {
        // Any other character
        this.word.write(c);

        // Add a line break if the current word would exceed the line's
        // character limit
        if (
          this.lineLen + this.space.length + this.word.printableRuneWidth() >
            this.limit &&
          this.word.printableRuneWidth() < this.limit
        ) {
          this.addNewLine();
        }
      }
    }

    return s.length;
  }

  /**
   * Finish the word-wrap operation. Always call it before retrieving the result.
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L152-L157
   */
  close(): void {
    this.addWord();
  }

  /**
   * Returns the word-wrapped result as a Uint8Array
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L159-L162
   */
  bytes(): Uint8Array {
    return new TextEncoder().encode(this.buf);
  }

  /**
   * Returns the word-wrapped result as a string
   * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L164-L167
   */
  toString(): string {
    return this.buf;
  }
}

/**
 * Returns a new instance of a word-wrapping writer, initialized with default settings.
 * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L33-L42
 * @public
 */
export function newWriter(limit: number): WordWrap {
  return new WordWrap(limit);
}

/**
 * Shorthand for declaring a new default WordWrap instance, used to immediately word-wrap a byte array.
 * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L44-L52
 * @public
 */
export function wrapBytes(b: Uint8Array, limit: number): Uint8Array {
  const w = newWriter(limit);
  w.write(b);
  w.close();
  return w.bytes();
}

/**
 * Shorthand for declaring a new default WordWrap instance, used to immediately word-wrap a string.
 * Reference: https://github.com/muesli/reflow/blob/master/wordwrap/wordwrap.go#L54-L58
 * @public
 */
export function wrapString(s: string, limit: number): string {
  const w = newWriter(limit);
  w.write(s);
  w.close();
  return w.toString();
}
