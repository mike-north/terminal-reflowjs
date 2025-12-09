import { describe, it, expect } from "vitest";
import { PaddingWriter, string, bytes } from "@/padding";

describe("PaddingWriter", () => {
  it("should pass through text with no padding (width 0)", () => {
    const writer = new PaddingWriter(0, null);
    writer.write("foobar");
    writer.flush();
    expect(writer.toString()).toBe("foobar");
  });

  it("should pad basic text to specified width", () => {
    const writer = new PaddingWriter(10, null);
    writer.write("foobar");
    writer.flush();
    expect(writer.toString()).toBe("foobar    ");
  });

  it("should pad multi-line text", () => {
    const writer = new PaddingWriter(6, null);
    writer.write("foo\nbar");
    writer.flush();
    expect(writer.toString()).toBe("foo   \nbar   ");
  });

  it("should not pad empty trailing lines", () => {
    const writer = new PaddingWriter(6, null);
    writer.write("foo\nbar\n");
    writer.flush();
    expect(writer.toString()).toBe("foo   \nbar   \n");
  });

  it("should preserve ANSI sequence codes", () => {
    const writer = new PaddingWriter(6, null);
    writer.write("\x1B[38;2;249;38;114mfoo");
    writer.flush();
    expect(writer.toString()).toBe("\x1B[38;2;249;38;114mfoo   ");
  });

  it("should handle multiple writes", () => {
    const writer = new PaddingWriter(6, null);
    writer.write("foo\n");
    writer.write("bar");
    writer.close();
    expect(writer.toString()).toBe("foo   \nbar   ");
  });

  it("should support custom padding function", () => {
    const writer = new PaddingWriter(4, (count: number) => ".".repeat(count));
    writer.write("");
    writer.flush();
    expect(writer.toString()).toBe("");
    
    const writer2 = new PaddingWriter(4, (count: number) => ".".repeat(count));
    writer2.write("a");
    writer2.flush();
    expect(writer2.toString()).toBe("a...");
  });

  it("should handle flush being called multiple times", () => {
    const writer = new PaddingWriter(6, null);
    writer.write("foo");
    writer.flush();
    expect(writer.toString()).toBe("foo   ");

    writer.write("bar");
    writer.flush();
    expect(writer.toString()).toBe("bar   ");
  });

  it("should handle ANSI codes with newlines", () => {
    const writer = new PaddingWriter(10, null);
    writer.write("\x1B[31mred\x1B[0m\nblue");
    writer.flush();
    expect(writer.toString()).toBe("\x1B[31mred\x1B[0m       \nblue      ");
  });

  it("should handle text with only ANSI codes (zero display width)", () => {
    const writer = new PaddingWriter(5, null);
    writer.write("\x1B[31m\x1B[0m");
    writer.flush();
    // ANSI codes with no visible content should not be padded (matches Go behavior)
    expect(writer.toString()).toBe("\x1B[31m\x1B[0m");
  });

  it("should handle mixed ANSI and regular text", () => {
    const writer = new PaddingWriter(10, null);
    writer.write("a\x1B[31mb\x1B[0mc");
    writer.flush();
    expect(writer.toString()).toBe("a\x1B[31mb\x1B[0mc       ");
  });

  it("should return bytes correctly", () => {
    const writer = new PaddingWriter(10, null);
    writer.write("foobar");
    writer.flush();
    const result = writer.bytes();
    expect(result.toString()).toBe("foobar    ");
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});

describe("string helper function", () => {
  it("should pad a string to specified width", () => {
    const actual = string("foobar", 10);
    const expected = "foobar    ";
    expect(actual).toBe(expected);
  });

  it("should handle empty string", () => {
    const actual = string("", 5);
    // Empty strings are not padded (matches Go behavior)
    const expected = "";
    expect(actual).toBe(expected);
  });

  it("should handle string with ANSI codes", () => {
    const actual = string("\x1B[31mred\x1B[0m", 10);
    const expected = "\x1B[31mred\x1B[0m       ";
    expect(actual).toBe(expected);
  });

  it("should handle multi-line string", () => {
    const actual = string("foo\nbar", 6);
    const expected = "foo   \nbar   ";
    expect(actual).toBe(expected);
  });
});

describe("bytes helper function", () => {
  it("should pad bytes to specified width", () => {
    const input = Buffer.from("foobar");
    const actual = bytes(input, 10);
    const expected = "foobar    ";
    expect(actual.toString()).toBe(expected);
    expect(Buffer.isBuffer(actual)).toBe(true);
  });

  it("should handle empty buffer", () => {
    const input = Buffer.from("");
    const actual = bytes(input, 5);
    // Empty buffers are not padded (matches Go behavior)
    const expected = "";
    expect(actual.toString()).toBe(expected);
  });

  it("should handle buffer with ANSI codes", () => {
    const input = Buffer.from("\x1B[31mred\x1B[0m");
    const actual = bytes(input, 10);
    const expected = "\x1B[31mred\x1B[0m       ";
    expect(actual.toString()).toBe(expected);
  });
});

describe("Edge cases from Go implementation", () => {
  it("should handle wide characters (emojis)", () => {
    // Emoji characters typically have width 2
    const writer = new PaddingWriter(8, null);
    writer.write("😀a");
    writer.flush();
    // Emoji takes 2 spaces, 'a' takes 1, so we need 5 more spaces
    expect(writer.toString()).toBe("😀a     ");
  });

  it("should handle Chinese characters (wide characters)", () => {
    // Chinese characters have width 2
    const writer = new PaddingWriter(6, null);
    writer.write("你好");
    writer.flush();
    // Two Chinese chars = 4 width, need 2 more spaces
    expect(writer.toString()).toBe("你好  ");
  });

  it("should handle mixed wide and narrow characters with ANSI", () => {
    const writer = new PaddingWriter(10, null);
    writer.write("\x1B[31m你\x1B[0ma");
    writer.flush();
    // Chinese char (2) + 'a' (1) = 3, need 7 spaces
    expect(writer.toString()).toBe("\x1B[31m你\x1B[0ma       ");
  });

  it("should handle text longer than padding width", () => {
    const writer = new PaddingWriter(5, null);
    writer.write("foobar");
    writer.flush();
    // Text is longer than padding, should not add padding
    expect(writer.toString()).toBe("foobar");
  });

  it("should handle exact width match", () => {
    const writer = new PaddingWriter(6, null);
    writer.write("foobar");
    writer.flush();
    expect(writer.toString()).toBe("foobar");
  });

  it("should handle newline at start", () => {
    const writer = new PaddingWriter(5, null);
    writer.write("\nfoo");
    writer.flush();
    expect(writer.toString()).toBe("\nfoo  ");
  });

  it("should handle multiple consecutive newlines", () => {
    const writer = new PaddingWriter(5, null);
    writer.write("a\n\nb");
    writer.flush();
    expect(writer.toString()).toBe("a    \n\nb    ");
  });

  it("should handle complex ANSI sequences", () => {
    // Test with 256-color ANSI code
    const writer = new PaddingWriter(10, null);
    writer.write("\x1B[38;5;208mtest");
    writer.flush();
    expect(writer.toString()).toBe("\x1B[38;5;208mtest      ");
  });

  it("should handle custom padding with dots", () => {
    const writer = new PaddingWriter(10, (count: number) => ".".repeat(count));
    writer.write("test");
    writer.flush();
    expect(writer.toString()).toBe("test......");
  });

  it("should handle custom padding with multi-line", () => {
    const writer = new PaddingWriter(6, (count: number) => "-".repeat(count));
    writer.write("a\nb");
    writer.flush();
    expect(writer.toString()).toBe("a-----\nb-----");
  });
});
