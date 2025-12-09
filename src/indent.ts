/**
 * Text indentation utilities with ANSI escape sequence preservation.
 * Ported from: https://github.com/muesli/reflow/tree/master/indent
 *
 * @packageDocumentation
 */

import * as ansi from './ansi';

/**
 * Function type for custom indentation.
 * Called once per indentation level to write custom indent characters.
 * @public
 */
export type IndentFunc = (writer: { write: (data: string) => void }) => void;

/**
 * Writer that adds indentation to text while preserving ANSI escape sequences.
 * Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go
 * @public
 */
export class Writer {
  /** Number of indentation units to apply */
  indent: number;
  /** Custom indentation function (optional) */
  indentFunc?: IndentFunc;

  private ansiWriter: ansi.Writer;
  private buf = '';
  private skipIndent = false;
  private inAnsi = false;

  constructor(indent: number, indentFunc?: IndentFunc) {
    this.indent = indent;
    this.indentFunc = indentFunc;
    
    // Create ANSI writer that writes to our internal buffer
    this.ansiWriter = new ansi.Writer({
      write: (data: string) => {
        this.buf += data;
      }
    });
  }

  /**
   * Write content to the indent buffer.
   * Automatically adds indentation at the start of each line while preserving ANSI sequences.
   */
  write(data: string | Uint8Array): number {
    const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
    
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      
      if (c === '\x1B') {
        // ANSI escape sequence start
        this.inAnsi = true;
      } else if (this.inAnsi) {
        // Check for ANSI sequence terminator
        // Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go#L62-L66
        if (ansi.isTerminator(c)) {
          // ANSI sequence terminated
          this.inAnsi = false;
        }
      } else {
        // Regular character (not part of ANSI sequence)
        if (!this.skipIndent) {
          // We're at the start of a line, need to add indentation
          // Reset any active ANSI styling before adding indent
          this.ansiWriter.resetAnsi();
          
          if (this.indentFunc) {
            // Use custom indent function
            for (let j = 0; j < this.indent; j++) {
              this.indentFunc(this.ansiWriter);
            }
          } else {
            // Use default space indentation
            this.ansiWriter.write(' '.repeat(this.indent));
          }

          this.skipIndent = true;
          // Restore any ANSI styling after indent
          this.ansiWriter.restoreAnsi();
        }

        if (c === '\n') {
          // End of current line - next character will need indentation
          this.skipIndent = false;
        }
      }

      // Write the character through the ANSI writer
      this.ansiWriter.write(c);
    }

    return str.length;
  }

  /**
   * Get the indented result as a string
   */
  string(): string {
    return this.buf;
  }

  /**
   * Get the indented result as a Uint8Array
   */
  bytes(): Uint8Array {
    return new TextEncoder().encode(this.buf);
  }
}

/**
 * Writer that pipes output to another writer instead of buffering.
 * Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go#L32-L39
 * @public
 */
export class WriterPipe {
  /** Number of indentation units to apply */
  indent: number;
  /** Custom indentation function (optional) */
  indentFunc?: IndentFunc;

  private ansiWriter: ansi.Writer;
  private skipIndent = false;
  private inAnsi = false;

  constructor(forward: { write: (data: string) => void }, indent: number, indentFunc?: IndentFunc) {
    this.indent = indent;
    this.indentFunc = indentFunc;
    
    // Create ANSI writer that forwards directly to the target
    this.ansiWriter = new ansi.Writer(forward);
  }

  /**
   * Write content and forward it with indentation applied.
   */
  write(data: string | Uint8Array): number {
    const str = typeof data === 'string' ? data : new TextDecoder().decode(data);
    
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      
      if (c === '\x1B') {
        // ANSI escape sequence start
        this.inAnsi = true;
      } else if (this.inAnsi) {
        // Check for ANSI sequence terminator
        if (ansi.isTerminator(c)) {
          // ANSI sequence terminated
          this.inAnsi = false;
        }
      } else {
        // Regular character (not part of ANSI sequence)
        if (!this.skipIndent) {
          // We're at the start of a line, need to add indentation
          this.ansiWriter.resetAnsi();
          
          if (this.indentFunc) {
            // Use custom indent function
            for (let j = 0; j < this.indent; j++) {
              this.indentFunc(this.ansiWriter);
            }
          } else {
            // Use default space indentation
            this.ansiWriter.write(' '.repeat(this.indent));
          }

          this.skipIndent = true;
          this.ansiWriter.restoreAnsi();
        }

        if (c === '\n') {
          // End of current line
          this.skipIndent = false;
        }
      }

      // Write the character through the ANSI writer
      this.ansiWriter.write(c);
    }

    return str.length;
  }
}

/**
 * Create a new indenting writer that buffers output.
 * Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go#L27-L30
 * @public
 */
export function newWriter(indent: number, indentFunc?: IndentFunc): Writer {
  return new Writer(indent, indentFunc);
}

/**
 * Create a new indenting writer that pipes output to another writer.
 * Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go#L32-L39
 * @public
 */
export function newWriterPipe(forward: { write: (data: string) => void }, indent: number, indentFunc?: IndentFunc): WriterPipe {
  return new WriterPipe(forward, indent, indentFunc);
}

/**
 * Indent a byte array by the specified number of spaces.
 * Convenience function for immediate indentation.
 * Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go#L41-L47
 * @public
 */
export function indentBytes(data: Uint8Array, indent: number): Uint8Array {
  const w = new Writer(indent);
  w.write(data);
  return w.bytes();
}

/**
 * Indent a string by the specified number of spaces.
 * Convenience function for immediate indentation.
 * Reference: https://github.com/muesli/reflow/blob/master/indent/indent.go#L49-L52
 * @public
 */
export function indentString(str: string, indent: number): string {
  const w = new Writer(indent);
  w.write(str);
  return w.string();
}
