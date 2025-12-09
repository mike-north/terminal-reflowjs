import { describe, it, expect } from "vitest";
import { truncate, TruncateWriter } from "@";

describe("truncate", () => {
  it("truncates plain text to width", () => {
    expect(truncate("Hello World", 5)).toBe("Hello");
  });

  it("appends tail when provided", () => {
    expect(truncate("Hello World", 8, { tail: "..." })).toBe("Hello...");
  });

  it("preserves ANSI sequences while truncating", () => {
    const input = "\x1b[31mHello World\x1b[0m";
    const result = truncate(input, 8, { tail: "…" });
    expect(result).toBe("\x1b[31mHello W…\x1b[0m");
  });

  it("falls back to tail when tail width exceeds limit", () => {
    expect(truncate("abcdef", 2, { tail: "..." })).toBe("...");
  });

  it("handles wide characters correctly", () => {
    expect(truncate("😀abc", 3)).toBe("😀a");
  });

  it("supports streaming writer usage", () => {
    const w = new TruncateWriter(7, { tail: ".." });
    w.write("terminal");
    expect(w.toString()).toBe("termi..");
  });

  it("truncates to exact limit with tail", () => {
    const w = new TruncateWriter(6, { tail: ".." });
    w.write("terminal");
    expect(w.toString()).toBe("term..");
  });

  it("does not truncate when content fits", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("does not add tail when content fits", () => {
    expect(truncate("Hi", 10, { tail: "..." })).toBe("Hi");
  });
});
