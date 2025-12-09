import { describe, it, expect } from "vitest";
import { margin, newWriter } from "@/margin";

describe("margin", () => {
  it("adds left and right margins", () => {
    const result = margin("Hello", { left: 2, right: 2 });
    expect(result).toBe("  Hello  ");
  });

  it("adds top and bottom margins", () => {
    const result = margin("Hello", { top: 1, bottom: 1 });
    expect(result).toBe("\nHello\n");
  });

  it("pads to target width when provided", () => {
    const writer = newWriter(10, { left: 2 });
    writer.write("hi");
    writer.close();
    expect(writer.toString()).toBe("  hi      ");
  });

  it("handles multi-line content", () => {
    const result = margin("a\nb", { left: 1, right: 1 });
    expect(result).toBe(" a \n b ");
  });
});

