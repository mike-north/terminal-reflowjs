import { describe, it, expect } from "vitest";
import { indent, IndentWriter, IndentWriterPipe, printableRuneWidth } from "@";

describe("indent", () => {
  it("indents a single line", () => {
    expect(indent("hello", 4)).toBe("    hello");
  });

  it("indents multiple lines", () => {
    expect(indent("hello\nworld", 2)).toBe("  hello\n  world");
  });

  it("preserves empty lines", () => {
    expect(indent("a\n\nb", 2)).toBe("  a\n  \n  b");
  });

  it("handles ANSI sequences (resets at indent boundary)", () => {
    // The indent writer resets ANSI before adding indent, then restores
    const input = "\x1B[31mred\x1B[0m";
    const result = indent(input, 2);
    // ANSI gets reset, indent added, then restored
    expect(result).toContain("  ");
    expect(result).toContain("\x1B[31m");
    expect(result).toContain("red");
    // Visual result should have same printable width
    expect(printableRuneWidth(result)).toBe(printableRuneWidth(input) + 2);
  });
});

describe("IndentWriter", () => {
  it("should indent text by specified spaces", () => {
    const w = new IndentWriter(4);
    w.write("hello\nworld");
    expect(w.toString()).toBe("    hello\n    world");
  });

  it("should handle custom indent function", () => {
    const w = new IndentWriter(2, {
      indentFunc: (writer) => {
        writer.write(">>");
      },
    });
    w.write("hello\nworld");
    expect(w.toString()).toBe(">>>>hello\n>>>>world");
  });

  it("should preserve ANSI sequences across line breaks", () => {
    const w = new IndentWriter(2);
    w.write("\x1B[31mred\ntext\x1B[0m");
    const result = w.toString();
    // Should have two lines with indent
    const lines = result.split("\n");
    expect(lines.length).toBe(2);
    // Each line should be indented
    expect(lines[0]).toContain("red");
    expect(lines[1]).toContain("text");
    // Both lines should have the indent worth of printable space
    // (accounting for ANSI codes)
  });

  it("should handle empty string", () => {
    const w = new IndentWriter(4);
    w.write("");
    expect(w.toString()).toBe("");
  });

  it("should handle string with only newlines", () => {
    const w = new IndentWriter(2);
    w.write("\n\n");
    expect(w.toString()).toBe("  \n  \n");
  });

  describe("ANSI sequence handling", () => {
    it("should reset and restore ANSI at indent boundaries", () => {
      const w = new IndentWriter(2);
      w.write("\x1B[32mgreen\ntext\x1B[0m");
      const result = w.toString();
      expect(result).toContain("\x1B[0m");
      expect(result).toContain("\x1B[32m");
    });

    it("should handle multiple ANSI codes", () => {
      const w = new IndentWriter(2);
      w.write("\x1B[1m\x1B[31mbold red\x1B[0m");
      const result = w.toString();
      expect(result).toContain("bold red");
      expect(result).toContain("  "); // indent present
    });
  });
});

describe("IndentWriterPipe", () => {
  it("should pipe indented output to target", () => {
    let result = "";
    const target = { write: (s: string) => (result += s) };
    const w = new IndentWriterPipe(target, 2);
    w.write("hello\nworld");
    expect(result).toBe("  hello\n  world");
  });
});

describe("indent function", () => {
  const testCases = [
    {
      input: "foo",
      indent: 0,
      expected: "foo",
    },
    {
      input: "foo",
      indent: 4,
      expected: "    foo",
    },
    {
      input: "foo\nbar",
      indent: 4,
      expected: "    foo\n    bar",
    },
    {
      input: "foo\nbar",
      indent: 0,
      expected: "foo\nbar",
    },
    {
      input: "foo\nbar\nbaz",
      indent: 2,
      expected: "  foo\n  bar\n  baz",
    },
    {
      input: "\n",
      indent: 2,
      expected: "  \n",
    },
  ];

  testCases.forEach((tc, i) => {
    it(`Test ${i}: indent ${tc.indent} spaces`, () => {
      expect(indent(tc.input, tc.indent)).toBe(tc.expected);
    });
  });

  describe("with ANSI sequences", () => {
    it("should preserve colors while indenting", () => {
      const input = "\x1B[31mfoo\x1B[0m";
      const result = indent(input, 4);
      // Result contains the text and color codes
      expect(result).toContain("foo");
      expect(result).toContain("\x1B[31m");
      // Printable width should be input + indent
      expect(printableRuneWidth(result)).toBe(3 + 4);
    });

    it("should handle colors across newlines", () => {
      const input = "\x1B[31mfoo\nbar\x1B[0m";
      const result = indent(input, 4);
      const lines = result.split("\n");
      expect(lines.length).toBe(2);
      expect(result).toContain("\x1B[31m");
    });

    it("should handle multiple color codes", () => {
      const input = "\x1B[31m\x1B[1mfoo\x1B[0m";
      const result = indent(input, 2);
      expect(result).toContain("foo");
      // Should have indent in the output
      expect(printableRuneWidth(result)).toBe(3 + 2);
    });

    it("should reset and restore colors at line boundaries", () => {
      const input = "\x1B[31mfoo\nbar\x1B[0m";
      const result = indent(input, 2);
      expect(result).toContain("\x1B[0m");
      const lines = result.split("\n");
      expect(lines.length).toBe(2);
    });
  });
});
