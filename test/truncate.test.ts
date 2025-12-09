import { describe, it, expect } from "vitest";
import { truncate, truncateWithTail, newWriter } from "@/truncate";

describe("truncate", () => {
  it("truncates plain text to width", () => {
    expect(truncate("Hello World", 5)).toBe("Hello");
  });

  it("appends tail when provided", () => {
    expect(truncateWithTail("Hello World", 8, "...")).toBe("Hello...");
  });

  it("preserves ANSI sequences while truncating width", () => {
    const input = "\x1b[31mHello World\x1b[0m";
    const result = truncateWithTail(input, 8, "…");
    expect(result).toBe("\x1b[31mHello W…\x1b[0m");
  });

  it("falls back to tail when tail width exceeds limit", () => {
    expect(truncateWithTail("abcdef", 2, "...")).toBe("...");
  });

  it("handles wide characters correctly", () => {
    expect(truncate("😀abc", 3)).toBe("😀a");
  });

  it("supports streaming writer usage", () => {
    // width=7, tail=".." (2 chars), available=5 for content
    // "terminal" -> "termi" (5 chars) + ".." = "termi.." (7 chars total)
    const w = newWriter(7, "..");
    w.write("terminal");
    expect(w.toString()).toBe("termi..");
  });

  it("truncates to exact limit with tail", () => {
    // width=6, tail=".." (2 chars), available=4 for content
    // "terminal" -> "term" (4 chars) + ".." = "term.." (6 chars total)
    const w = newWriter(6, "..");
    w.write("terminal");
    expect(w.toString()).toBe("term..");
  });

  it("does not truncate when content fits", () => {
    const result = truncate("Hello", 10);
    expect(result).toBe("Hello");
  });

  it("does not add tail when content fits", () => {
    const result = truncateWithTail("Hi", 10, "...");
    expect(result).toBe("Hi");
  });
});
