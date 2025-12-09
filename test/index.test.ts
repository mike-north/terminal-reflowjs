import { describe, it, expect } from "vitest";
import { ansi, wrap } from "@/index";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify ansi module exports
    expect(ansi).toBeDefined();
    expect(ansi.Marker).toBeDefined();
    expect(ansi.isTerminator).toBeDefined();
    expect(ansi.printableRuneWidth).toBeDefined();

    // Verify wrap module exports
    expect(wrap).toBeDefined();
    expect(wrap.Writer).toBeDefined();
    expect(wrap.wrapString).toBeDefined();
    expect(wrap.wrapBytes).toBeDefined();
  });
});
