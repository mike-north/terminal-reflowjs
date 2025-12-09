import { describe, it, expect } from "vitest";
import { margin, MarginWriter } from "@";

describe("margin", () => {
  it("adds left margin", () => {
    const result = margin("hello", { left: 4 });
    expect(result).toBe("    hello");
  });

  it("adds top margin", () => {
    const result = margin("hello", { top: 2 });
    expect(result).toBe("\n\nhello");
  });

  it("adds bottom margin", () => {
    const result = margin("hello", { bottom: 2 });
    expect(result).toBe("hello\n\n");
  });

  it("combines margins", () => {
    const result = margin("hi", { left: 2, top: 1, bottom: 1 });
    expect(result).toBe("  \n  hi\n  ");
  });
});

describe("MarginWriter", () => {
  it("applies margins via writer interface", () => {
    const w = new MarginWriter({ left: 2, top: 1 });
    w.write("hello");
    w.close();
    expect(w.toString()).toBe("  \n  hello");
  });

  it("handles multiline content", () => {
    const w = new MarginWriter({ left: 2 });
    w.write("foo\nbar");
    w.close();
    expect(w.toString()).toBe("  foo\n  bar");
  });

  it("throws if written after close", () => {
    const w = new MarginWriter({ left: 2 });
    w.close();
    expect(() => {
      w.write("test");
    }).toThrow();
  });
});
