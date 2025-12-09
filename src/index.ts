/**
 * ANSI-aware text reflow utilities for terminal output.
 *
 * This library provides text transformation functions that correctly handle
 * ANSI escape sequences (colors, styles) while wrapping, truncating, padding,
 * and indenting text for terminal display.
 *
 * @example
 * ```ts
 * import { wordwrap, truncate, indent, pad } from 'terminal-reflowjs';
 *
 * // Word-wrap to 40 columns
 * const wrapped = wordwrap(longText, 40);
 *
 * // Truncate with ellipsis
 * const short = truncate(title, 20, { tail: '...' });
 *
 * // Indent by 4 spaces
 * const indented = indent(code, 4);
 *
 * // Pad lines to 80 columns
 * const padded = pad(text, 80);
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// Primary Functions (recommended API)
// =============================================================================

export { wordwrap, type WordWrapOptions } from "./wordwrap";
export { hardwrap, type HardWrapOptions } from "./hardwrap";
export { truncate, type TruncateOptions } from "./truncate";
export { indent, type IndentOptions, type IndentFunc } from "./indent";
export { dedent } from "./dedent";
export { pad, type PadOptions, type PadFunc } from "./padding";
export { margin, type MarginOptions } from "./margin";

// =============================================================================
// Writer Classes (for streaming/incremental processing)
// =============================================================================

export { WordWrapWriter } from "./wordwrap";
export { HardWrapWriter } from "./hardwrap";
export { TruncateWriter } from "./truncate";
export { IndentWriter, IndentWriterPipe } from "./indent";
export { PadWriter } from "./padding";
export { MarginWriter } from "./margin";

// =============================================================================
// ANSI Utilities
// =============================================================================

export {
  ANSI_MARKER,
  ANSI_RESET,
  isAnsiTerminator,
  printableRuneWidth,
  stripAnsi,
  AnsiBuffer,
  AnsiPassthrough,
} from "./ansi";
