import { describe, it, expect } from "vitest";
import { margin, newWriter } from "@/margin";

describe("margin", () => {
  it("should handle no-op (no margins)", () => {
    const result = margin("foobar", {});
    expect(result).toBe("foobar");
  });

  it("should add basic left and right margins", () => {
    const result = margin("foobar", { left: 2, right: 2 });
    expect(result).toBe("  foobar  ");
  });

  it("should handle asymmetric margins", () => {
    const result = margin("foo", { left: 2, right: 1 });
    expect(result).toBe("  foo ");
  });

  it("should add margins to multi-line text", () => {
    const result = margin("foo\nbar", { left: 1, right: 1 });
    expect(result).toBe(" foo \n bar ");
  });

  it("should not pad empty trailing lines", () => {
    const result = margin("foo\nbar\n", { left: 1, right: 1 });
    expect(result).toBe(" foo \n bar \n");
  });

  it("should handle ANSI sequence codes", () => {
    // ANSI color code for magenta (from Go test)
    const input = "\x1B[38;2;249;38;114mfoo";
    const result = margin(input, { left: 3, right: 3 });
    // The ANSI codes should be preserved and not counted in width calculation
    expect(result).toBe("   \x1B[38;2;249;38;114mfoo   ");
  });

  it("should add top margin", () => {
    const result = margin("foo", { top: 2 });
    expect(result).toBe("\n\nfoo");
  });

  it("should add bottom margin", () => {
    const result = margin("foo", { bottom: 2 });
    expect(result).toBe("foo\n\n");
  });

  it("should add all margins (top, right, bottom, left)", () => {
    const result = margin("foo", { top: 1, right: 2, bottom: 1, left: 2 });
    expect(result).toBe("\n  foo  \n");
  });

  it("should handle multi-line with top and bottom margins", () => {
    const result = margin("foo\nbar", { top: 1, bottom: 1, left: 1 });
    expect(result).toBe("\n foo\n bar\n");
  });

  it("should handle empty string", () => {
    const result = margin("", { left: 2, right: 2 });
    expect(result).toBe("");
  });

  it("should handle single newline", () => {
    const result = margin("\n", { left: 1, right: 1 });
    // Empty lines should not get indentation
    expect(result).toBe("\n");
  });
});

describe("newWriter", () => {
  it("should work with writer API", () => {
    const writer = newWriter(10, { left: 2, right: 0 });
    writer.write("foobar");
    writer.close();
    expect(writer.toString()).toBe("  foobar  ");
  });

  it("should handle multiple writes", () => {
    const writer = newWriter(10, { left: 2 });
    writer.write("foo");
    writer.write("bar");
    writer.close();
    expect(writer.toString()).toBe("  foobar  ");
  });

  it("should handle writes with newlines", () => {
    const writer = newWriter(5, { left: 1 });
    writer.write("foo\n");
    writer.write("bar");
    writer.close();
    // With width=5 (total) and left=1, the content area is 4 chars, but "foo" is 3 chars
    // So: " foo " (1 left + 3 content + 1 padding to reach 5)
    expect(writer.toString()).toBe(" foo \n bar ");
  });

  it("should throw error when writing to closed writer", () => {
    const writer = newWriter(10, { left: 2 });
    writer.write("test");
    writer.close();
    expect(() => writer.write("more")).toThrow("Writer is closed");
  });

  it("should handle ANSI codes with writer", () => {
    const writer = newWriter(9, { left: 3 });
    writer.write("\x1B[38;2;249;38;114mfoo");
    writer.close();
    const result = writer.toString();
    // Should preserve ANSI codes and calculate visible length correctly
    expect(result).toContain("\x1B[38;2;249;38;114mfoo");
    expect(result).toContain("   "); // left margin
  });
});
