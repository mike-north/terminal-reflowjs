/**
 * Add indentation to text while preserving ANSI sequences.
 *
 * Adds consistent indentation at the start of each line,
 * properly handling ANSI escape sequences.
 *
 * @packageDocumentation
 */

import { AnsiPassthrough, isAnsiTerminator } from "./ansi";

/**
 * Custom indentation function type.
 * Called once per indentation level to write custom indent characters.
 * @public
 */
export type IndentFunc = (writer: { write: (data: string) => void }) => void;

/**
 * Options for indentation.
 * @public
 */
export interface IndentOptions {
  /** Custom function to generate indentation (overrides default spaces) */
  indentFunc?: IndentFunc;
}

/**
 * Indent writer for streaming text processing.
 *
 * Adds indentation at the start of each line while preserving
 * ANSI escape sequences correctly.
 *
 * @example
 * ```ts
 * const writer = new IndentWriter(4);
 * writer.write("line 1\nline 2");
 * console.log(writer.toString());
 * // "    line 1\n    line 2"
 * ```
 *
 * @public
 */
export class IndentWriter {
  /** Number of indentation units */
  readonly indent: number;
  /** Custom indentation function */
  readonly indentFunc?: IndentFunc;

  private ansiPassthrough: AnsiPassthrough;
  private buf = "";
  private skipIndent = false;
  private inAnsi = false;

  constructor(indent: number, options: IndentOptions = {}) {
    this.indent = indent;
    this.indentFunc = options.indentFunc;

    this.ansiPassthrough = new AnsiPassthrough({
      write: (data: string) => {
        this.buf += data;
      },
    });
  }

  /**
   * Write content, adding indentation at the start of each line.
   */
  write(data: string): void {
    for (const c of data) {
      if (c === "\x1B") {
        this.inAnsi = true;
      } else if (this.inAnsi) {
        if (isAnsiTerminator(c)) {
          this.inAnsi = false;
        }
      } else {
        if (!this.skipIndent) {
          this.ansiPassthrough.resetAnsi();

          if (this.indentFunc) {
            for (let j = 0; j < this.indent; j++) {
              this.indentFunc(this.ansiPassthrough);
            }
          } else {
            this.ansiPassthrough.write(" ".repeat(this.indent));
          }

          this.skipIndent = true;
          this.ansiPassthrough.restoreAnsi();
        }

        if (c === "\n") {
          this.skipIndent = false;
        }
      }

      this.ansiPassthrough.write(c);
    }
  }

  /**
   * Get the indented result as a string.
   */
  toString(): string {
    return this.buf;
  }
}

/**
 * Indent a string by the specified number of spaces.
 *
 * Adds indentation at the start of each line while preserving
 * ANSI escape sequences.
 *
 * @param s - The string to indent
 * @param spaces - Number of spaces to indent
 * @param options - Indentation options
 * @returns The indented string
 *
 * @example
 * ```ts
 * indent("hello\nworld", 4);
 * // "    hello\n    world"
 * ```
 *
 * @public
 */
export function indent(
  s: string,
  spaces: number,
  options?: IndentOptions
): string {
  const w = new IndentWriter(spaces, options);
  w.write(s);
  return w.toString();
}


/**
 * Indent writer that pipes output directly to another writer.
 * @public
 */
export class IndentWriterPipe {
  readonly indent: number;
  readonly indentFunc?: IndentFunc;

  private ansiPassthrough: AnsiPassthrough;
  private skipIndent = false;
  private inAnsi = false;

  constructor(
    forward: { write: (data: string) => void },
    indent: number,
    options: IndentOptions = {}
  ) {
    this.indent = indent;
    this.indentFunc = options.indentFunc;
    this.ansiPassthrough = new AnsiPassthrough(forward);
  }

  write(data: string): void {
    for (const c of data) {
      if (c === "\x1B") {
        this.inAnsi = true;
      } else if (this.inAnsi) {
        if (isAnsiTerminator(c)) {
          this.inAnsi = false;
        }
      } else {
        if (!this.skipIndent) {
          this.ansiPassthrough.resetAnsi();

          if (this.indentFunc) {
            for (let j = 0; j < this.indent; j++) {
              this.indentFunc(this.ansiPassthrough);
            }
          } else {
            this.ansiPassthrough.write(" ".repeat(this.indent));
          }

          this.skipIndent = true;
          this.ansiPassthrough.restoreAnsi();
        }

        if (c === "\n") {
          this.skipIndent = false;
        }
      }

      this.ansiPassthrough.write(c);
    }
  }
}

