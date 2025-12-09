import { describe, it, expect } from "vitest";
import { pad, newWriter } from "@/padding";

describe("padding", () => {
  it("should pad a single line", () => {
    const result = pad("Hello", 8);
    expect(result).toBe("Hello   ");
  });

  it("should pad multiple lines", () => {
    const result = pad("foo\nbar", 5);
    expect(result).toBe("foo  \nbar  ");
  });

  it("should handle zero width", () => {
    const result = pad("test", 0);
    expect(result).toBe("test");
  });

  it("should not pad lines longer than width", () => {
    const result = pad("toolong", 5);
    expect(result).toBe("toolong");
  });

  it("should handle trailing newline", () => {
    const result = pad("foo\nbar\n", 5);
    expect(result).toBe("foo  \nbar  \n");
  });

  it("should handle empty string", () => {
    const result = pad("", 5);
    expect(result).toBe("");
  });

  it("should handle ANSI codes correctly", () => {
    const input = "\x1B[31mfoo\x1B[0m";
    const result = pad(input, 6);
    // ANSI codes should not count towards width
    expect(result).toBe("\x1B[31mfoo\x1B[0m   ");
  });
});

describe("padding newWriter", () => {
  it("should work with writer API", () => {
    const writer = newWriter(8, null);
    writer.write("test");
    writer.close();
    expect(writer.toString()).toBe("test    ");
  });

  it("should handle multiple writes", () => {
    const writer = newWriter(10, null);
    writer.write("foo");
    writer.write("bar");
    writer.close();
    expect(writer.toString()).toBe("foobar    ");
  });

  it("should handle writes with newlines", () => {
    const writer = newWriter(5, null);
    writer.write("foo\n");
    writer.write("bar");
    writer.close();
    expect(writer.toString()).toBe("foo  \nbar  ");
  });

  it("should support custom padding function", () => {
    const writer = newWriter(6, (w) => w.write("."));
    writer.write("hi");
    writer.close();
    expect(writer.toString()).toBe("hi....");
  });

  it("should throw when writing to closed writer", () => {
    const writer = newWriter(5, null);
    writer.close();
    expect(() => writer.write("test")).toThrow("Writer is closed");
  });
});
