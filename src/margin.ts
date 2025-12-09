/**
 * Add margins around text.
 *
 * Applies top, bottom, left, and right margins to text content.
 *
 * @packageDocumentation
 */

import { printableRuneWidth } from "./ansi";

/**
 * Options for margins.
 * @public
 */
export interface MarginOptions {
  /** Top margin (number of blank lines) */
  top?: number;
  /** Bottom margin (number of blank lines) */
  bottom?: number;
  /** Left margin (number of spaces) */
  left?: number;
  /** Right margin (number of spaces / padding width) */
  right?: number;
}

/**
 * Margin writer for streaming text processing.
 *
 * Applies margins around text content. Call close() before
 * retrieving the result.
 *
 * @example
 * ```ts
 * const writer = new MarginWriter({ left: 4, top: 1 });
 * writer.write("Hello\nWorld");
 * writer.close();
 * console.log(writer.toString());
 * ```
 *
 * @public
 */
export class MarginWriter {
  /** Target width for the output (0 = no width constraint) */
  readonly width: number;
  /** Margin options */
  readonly options: Required<MarginOptions>;

  private buffer = "";
  private result = "";
  private closed = false;

  constructor(options: MarginOptions = {}, width = 0) {
    this.width = width;
    this.options = {
      top: options.top ?? 0,
      bottom: options.bottom ?? 0,
      left: options.left ?? 0,
      right: options.right ?? 0,
    };
  }

  /**
   * Write content to the margin buffer.
   */
  write(s: string): void {
    if (this.closed) {
      throw new Error("MarginWriter already closed");
    }
    this.buffer += s;
  }

  /**
   * Finalize margins and prepare the result.
   */
  close(): void {
    if (this.closed) return;
    this.result = this.applyMargins(this.buffer);
    this.closed = true;
  }

  /**
   * Get the result with margins applied.
   */
  toString(): string {
    if (!this.closed) {
      this.close();
    }
    return this.result;
  }

  private applyMargins(content: string): string {
    const lines = content.split("\n");
    const leftSpaces = " ".repeat(this.options.left);

    const paddedLines = lines.map((line) => {
      const visibleWidth = printableRuneWidth(line);
      const desiredRight =
        this.options.right ||
        (this.width > 0
          ? Math.max(0, this.width - this.options.left - visibleWidth)
          : 0);
      const rightSpaces = " ".repeat(desiredRight);
      return `${leftSpaces}${line}${rightSpaces}`;
    });

    const blankLine = " ".repeat(this.options.left + this.options.right);
    const top = Array.from({ length: this.options.top }, () => blankLine);
    const bottom = Array.from({ length: this.options.bottom }, () => blankLine);

    return [...top, ...paddedLines, ...bottom].join("\n");
  }
}

/**
 * Add margins around text.
 *
 * Applies top, bottom, left, and right margins to text content.
 *
 * @param s - The text to add margins to
 * @param options - Margin configuration
 * @returns The text with margins applied
 *
 * @example
 * ```ts
 * margin("Hello", { left: 4, top: 1 });
 * // "\n    Hello"
 * ```
 *
 * @public
 */
export function margin(s: string, options: MarginOptions): string {
  const writer = new MarginWriter(options);
  writer.write(s);
  writer.close();
  return writer.toString();
}

