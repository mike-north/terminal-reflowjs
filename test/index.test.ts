import { describe, it, expect } from "vitest";
import { dedent } from "@/index";

describe("Module Structure", () => {
  it("should export all modules from index", () => {
    // Verify dedent module exports
    expect(dedent).toBeDefined();
    expect(dedent.dedentString).toBeDefined();
  });
});
