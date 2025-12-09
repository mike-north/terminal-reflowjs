import { describe, it, expect } from "vitest";
import { truncate, ansi } from "@/index";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify truncate module exports
    expect(truncate).toBeDefined();
    expect(truncate.TruncateWriter).toBeDefined();
    expect(truncate.truncateString).toBeDefined();
    expect(truncate.truncateStringWithTail).toBeDefined();
    expect(truncate.truncateBytes).toBeDefined();
    expect(truncate.truncateBytesWithTail).toBeDefined();
    
    // Verify ansi module exports
    expect(ansi).toBeDefined();
    expect(ansi.ANSI_MARKER).toBeDefined();
    expect(ansi.isAnsiTerminator).toBeDefined();
    expect(ansi.printableRuneWidth).toBeDefined();
    expect(ansi.AnsiWriter).toBeDefined();
  });
});
