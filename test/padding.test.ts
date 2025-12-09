import { describe, it, expect } from "vitest";
import { pad, PadWriter } from "@";

describe("pad", () => {
  it("pads a string to specified width", () => {
    expect(pad("hello", 10)).toBe("hello     ");
  });

  it("does not pad if already at width", () => {
    expect(pad("hello", 5)).toBe("hello");
  });

  it("handles multiple lines", () => {
    expect(pad("hi\nthere", 6)).toBe("hi    \nthere ");
  });

  it("preserves ANSI sequences", () => {
    const input = "\x1B[31mred\x1B[0m";
    const result = pad(input, 6);
    expect(result).toBe("\x1B[31mred\x1B[0m   ");
  });
});

describe("PadWriter", () => {
  it("should pad content to width", () => {
    const w = new PadWriter(10);
    w.write("hello");
    w.close();
    expect(w.toString()).toBe("hello     ");
  });

  it("should not pad empty lines", () => {
    const w = new PadWriter(10);
    w.write("\n\n");
    w.close();
    expect(w.toString()).toBe("\n\n");
  });

  it("should handle custom pad function", () => {
    const w = new PadWriter(8, { padFunc: (n) => ".".repeat(n) });
    w.write("hello");
    w.close();
    expect(w.toString()).toBe("hello...");
  });

  describe("ANSI handling", () => {
    it("should not count ANSI codes toward width", () => {
      const w = new PadWriter(10);
      w.write("\x1B[31mred\x1B[0m");
      w.close();
      expect(w.toString()).toBe("\x1B[31mred\x1B[0m       ");
    });

    it("should handle complex ANSI sequences", () => {
      const w = new PadWriter(10);
      w.write("\x1B[38;2;255;0;0mtext\x1B[0m");
      w.close();
      expect(w.toString()).toBe("\x1B[38;2;255;0;0mtext\x1B[0m      ");
    });
  });

  describe("multiline handling", () => {
    it("should pad each line independently", () => {
      const w = new PadWriter(10);
      w.write("foo\nbar\nbaz");
      w.close();
      expect(w.toString()).toBe("foo       \nbar       \nbaz       ");
    });

    it("should not pad empty lines", () => {
      const w = new PadWriter(10);
      w.write("foo\n\nbar");
      w.close();
      expect(w.toString()).toBe("foo       \n\nbar       ");
    });
  });
});

describe("pad function", () => {
  const testCases = [
    { input: "", width: 0, expected: "" },
    { input: "", width: 4, expected: "" },
    { input: "foo", width: 0, expected: "foo" },
    { input: "foo", width: 3, expected: "foo" },
    { input: "foo", width: 4, expected: "foo " },
    { input: "foo", width: 10, expected: "foo       " },
    { input: "foo\n", width: 4, expected: "foo \n" },
    { input: "foo\n", width: 10, expected: "foo       \n" },
    { input: "foo\nbar", width: 4, expected: "foo \nbar " },
    { input: "\n", width: 4, expected: "\n" },
  ];

  testCases.forEach((tc, i) => {
    it(`Test ${i}: "${tc.input}" with width ${tc.width}`, () => {
      expect(pad(tc.input, tc.width)).toBe(tc.expected);
    });
  });

  describe("ANSI sequence handling", () => {
    it("should ignore ANSI sequences in width calculation", () => {
      const input = "\x1B[31mfoo\x1B[0m";
      const result = pad(input, 4);
      expect(result).toBe("\x1B[31mfoo\x1B[0m ");
    });

    it("should handle complex ANSI sequences", () => {
      const input =
        "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m";
      const result = pad(input, 10);
      expect(result).toBe(input + "   ");
    });
  });

  describe("wide characters", () => {
    it("should handle CJK characters correctly", () => {
      const result = pad("中文", 6);
      expect(result).toBe("中文  ");
    });

    it("should handle emoji correctly", () => {
      const result = pad("😀", 4);
      expect(result).toBe("😀  ");
    });
  });
});
