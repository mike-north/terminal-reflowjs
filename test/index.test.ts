import { describe, it, expect } from "vitest";
import { wordwrap } from "@/index";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify wordwrap module exports
    expect(wordwrap).toBeDefined();
    expect(wordwrap.WordWrap).toBeDefined();
    expect(wordwrap.newWriter).toBeDefined();
    expect(wordwrap.wrapString).toBeDefined();
    expect(wordwrap.wrapBytes).toBeDefined();
  });
});
