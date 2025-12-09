import { describe, it, expect } from "vitest";
import { ansi, dedent, indent, padding, wordwrap, wrap, truncate } from "@/index";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify ansi module exports
    expect(ansi).toBeDefined();
    
    // Verify wordwrap module exports
    expect(wordwrap).toBeDefined();
    
    // Verify wrap module exports  
    expect(wrap).toBeDefined();
    
    // Verify indent module exports
    expect(indent).toBeDefined();
    
    // Verify dedent module exports
    expect(dedent).toBeDefined();
    
    // Verify padding module exports
    expect(padding).toBeDefined();
    expect(padding.PaddingWriter).toBeDefined();
    expect(padding.string).toBeDefined();
    expect(padding.bytes).toBeDefined();
    
    // Verify truncate module exports
    expect(truncate).toBeDefined();
  });
});
