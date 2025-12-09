import { describe, it, expect } from "vitest";
import { ansi, indent } from "@/index";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify ansi module exports
    expect(ansi).toBeDefined();
    expect(ansi.MARKER).toBeDefined();
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
  });
});
