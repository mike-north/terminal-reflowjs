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

export * as ansi from "./ansi";
export * as wordwrap from "./wordwrap";
export * as wrap from "./wrap";
export * as indent from "./indent";
export * as dedent from "./dedent";
export * as padding from "./padding";
export * as truncate from "./truncate";
export * as margin from "./margin";
