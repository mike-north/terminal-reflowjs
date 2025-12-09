/**
 * ANSI-aware text reflow utilities for terminal output.
 *
 * This library provides a collection of ANSI-sequence aware text reflow
 * operations and algorithms, including word wrapping, truncation, padding,
 * indentation, and more.
 *
 * Based on {@link https://github.com/muesli/reflow | muesli/reflow} for Go.
 *
 * @packageDocumentation
 */

export {
  ANSI_MARKER,
  ANSI_RESET,
  AnsiWriter,
  WriterBase as AnsiWriterBase,
  isAnsiTerminator,
  isTerminator,
  printableRuneWidth,
} from "./ansi";
export {
  wordwrap,
  wrapBytes as wordwrapBytes,
  wrapString as wordwrapString,
  newWriter as newWordwrapWriter,
  WordWrap,
} from "./wordwrap";
export {
  wrap,
  wrapBytes,
  wrapString,
  newWriter as newWrapWriter,
  Writer as WrapWriter,
} from "./wrap";
export {
  type IndentFunc,
  indentBytes,
  indentString,
  newWriter as newIndentWriter,
  newWriterPipe as newIndentWriterPipe,
  Writer as IndentWriter,
  WriterPipe as IndentWriterPipe,
} from "./indent";
export { dedent } from "./dedent";
export { bytes, string, PaddingWriter } from "./padding";
export {
  truncate,
  truncateWithTail,
  newWriter as newTruncateWriter,
} from "./truncate";
export { margin, newWriter as newMarginWriter } from "./margin";
