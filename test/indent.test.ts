import { describe, it, expect } from "vitest";
import { indent, newWriter } from "@/indent";

describe("indent", () => {
  it("should indent a single line", () => {
    const result = indent("Hello", 4);
    expect(result).toBe("    Hello");
  });

  it("should indent multiple lines", () => {
    const result = indent("foo\nbar", 2);
    expect(result).toBe("  foo\n  bar");
  });

  it("should handle zero indentation", () => {
    const result = indent("test", 0);
    expect(result).toBe("test");
  });

  it("should not indent empty lines", () => {
    const result = indent("foo\n\nbar", 2);
    expect(result).toBe("  foo\n\n  bar");
  });

  it("should handle trailing newline", () => {
    const result = indent("foo\nbar\n", 2);
    expect(result).toBe("  foo\n  bar\n");
  });

  it("should handle empty string", () => {
    const result = indent("", 2);
    expect(result).toBe("");
  });
});

describe("indent newWriter", () => {
  it("should work with writer API", () => {
    const writer = newWriter(4, null);
    writer.write("test");
    writer.close();
    expect(writer.toString()).toBe("    test");
  });

  it("should handle multiple writes", () => {
    const writer = newWriter(2, null);
    writer.write("foo");
    writer.write("bar");
    writer.close();
    expect(writer.toString()).toBe("  foobar");
  });

  it("should handle writes with newlines", () => {
    const writer = newWriter(2, null);
    writer.write("foo\n");
    writer.write("bar");
    writer.close();
    expect(writer.toString()).toBe("  foo\n  bar");
  });

  it("should support custom indent function", () => {
    const writer = newWriter(3, (w) => w.write("."));
    writer.write("test");
    writer.close();
    expect(writer.toString()).toBe("...test");
  });

  it("should throw when writing to closed writer", () => {
    const writer = newWriter(2, null);
    writer.close();
    expect(() => writer.write("test")).toThrow("Writer is closed");
  });
});
