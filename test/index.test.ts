import { describe, it, expect } from "vitest";
import { ansi, dedent, indent, padding, wordwrap, wrap } from "@";
import { truncate } from "fs";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify exports exist from each module
    expect(ansi.ansiString).toBeDefined();
    expect(ansi.strip).toBeDefined();
    expect(ansi.printableLength).toBeDefined();

    expect(wordwrap.newWriter).toBeDefined();
    expect(wordwrap.wordwrap).toBeDefined();

    expect(wrap.newWriter).toBeDefined();
    expect(wrap.wrap).toBeDefined();

    expect(indent.newWriter).toBeDefined();
    expect(indent).toBeDefined();

    expect(dedent).toBeDefined();

    expect(padding.pad).toBeDefined();

    expect(truncate).toBeDefined();
    expect(truncate).toBeDefined();
  });
});
