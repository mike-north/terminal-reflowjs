import { describe, it, expect } from "vitest";
import * as index from "@/index";
const { ansi, indent, dedent, padding, truncate, wordwrap, wrap, margin } = index;

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify ansi module exports
    expect(ansi).toBeDefined();
    expect(ansi.MARKER).toBeDefined();
    expect(ansi.Marker).toBeDefined();
    expect(ansi.isTerminator).toBeDefined();
    expect(ansi.Writer).toBeDefined();

    // Verify indent module exports
    expect(indent).toBeDefined();
    expect(indent.Writer).toBeDefined();
    expect(indent.WriterPipe).toBeDefined();
    expect(indent.newWriter).toBeDefined();
    expect(indent.newWriterPipe).toBeDefined();
    expect(indent.indentBytes).toBeDefined();
    expect(indent.indentString).toBeDefined();

    // Verify other modules exist
    expect(dedent).toBeDefined();
    expect(dedent.dedent).toBeDefined();
    expect(dedent.dedentString).toBeDefined();

    expect(padding).toBeDefined();

    expect(truncate).toBeDefined();
    expect(truncate.truncate).toBeDefined();
    expect(truncate.truncateWithTail).toBeDefined();
    expect(truncate.newWriter).toBeDefined();

    expect(wordwrap).toBeDefined();
    expect(wordwrap.wrapString).toBeDefined();
    expect(wordwrap.newWriter).toBeDefined();
    expect(wordwrap.WordWrap).toBeDefined();

    expect(wrap).toBeDefined();
    expect(wrap.wrapString).toBeDefined();
    expect(wrap.Writer).toBeDefined();
    expect(wrap.newWriter).toBeDefined();

    expect(margin).toBeDefined();
  });
});
