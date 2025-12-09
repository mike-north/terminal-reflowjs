import { describe, it, expect } from "vitest";
import { wordwrap, WordWrapWriter } from "@";

describe("wordwrap", () => {
  it("wraps at word boundaries", () => {
    const result = wordwrap("Hello World!", 5);
    expect(result).toBe("Hello\nWorld!");
  });

  it("supports custom breakpoints", () => {
    const writer = new WordWrapWriter(4, { breakpoints: [",", " "] });
    writer.write("foo,bar");
    writer.close();
    expect(writer.toString()).toBe("foo,\nbar");
  });

  it("does not break long words (passes through)", () => {
    expect(wordwrap("Supercalifragilistic", 6)).toBe("Supercalifragilistic");
  });

  it("preserves ANSI sequences during wrapping", () => {
    const input = "\x1b[31mred text\x1b[0m";
    const result = wordwrap(input, 4);
    expect(result).toBe("\x1b[31mred\ntext\x1b[0m");
  });

  it("respects existing newlines", () => {
    const result = wordwrap("one two\nthree four", 5);
    expect(result).toBe("one\ntwo\nthree\nfour");
  });
});

describe("WordWrapWriter", () => {
  const testCases = [
    {
      description: "No-op, should pass through, including trailing whitespace",
      input: "foobar\n ",
      expected: "foobar\n ",
      limit: 0,
      keepNewlines: true,
    },
    {
      description: "Nothing to wrap here, should pass through",
      input: "foo",
      expected: "foo",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "A single word that is too long passes through",
      input: "foobarfoo",
      expected: "foobarfoo",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "Lines are broken at whitespace",
      input: "foo bar foo",
      expected: "foo\nbar\nfoo",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "A hyphen is a valid breakpoint",
      input: "foo-foobar",
      expected: "foo-\nfoobar",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "Space buffer needs to be emptied before breakpoints",
      input: "foo --bar",
      expected: "foo --bar",
      limit: 9,
      keepNewlines: true,
    },
    {
      description: "Lines are broken at whitespace, even if words are too long",
      input: "foo bars foobars",
      expected: "foo\nbars\nfoobars",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "A word that would run beyond the limit is wrapped",
      input: "foo bar",
      expected: "foo\nbar",
      limit: 5,
      keepNewlines: true,
    },
    {
      description: "Whitespace that trails a line and fits passes through",
      input: "foo\nb\t a\n bar",
      expected: "foo\nb\t a\n bar",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "Trailing whitespace is removed if it doesn't fit",
      input: "foo    \nb   ar   ",
      expected: "foo\nb\nar",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "An explicit line break at the end is preserved",
      input: "foo bar foo\n",
      expected: "foo\nbar\nfoo\n",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "Explicit breaks are always preserved",
      input: "\nfoo bar\n\n\nfoo\n",
      expected: "\nfoo\nbar\n\n\nfoo\n",
      limit: 4,
      keepNewlines: true,
    },
    {
      description: "Unless we ask them to be ignored",
      input: "\nfoo bar\n\n\nfoo\n",
      expected: "foo\nbar\nfoo",
      limit: 4,
      keepNewlines: false,
    },
    {
      description: "Complete example",
      input: " This is a list: \n\n\t* foo\n\t* bar\n\n\n\t* foo  \nbar    ",
      expected: " This\nis a\nlist: \n\n\t* foo\n\t* bar\n\n\n\t* foo\nbar",
      limit: 6,
      keepNewlines: true,
    },
    {
      description: "ANSI sequence codes don't affect length calculation",
      input:
        "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m",
      expected:
        "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m",
      limit: 7,
      keepNewlines: true,
    },
    {
      description: "ANSI control codes don't get wrapped",
      input:
        "\x1B[38;2;249;38;114m(\x1B[0m\x1B[38;2;248;248;242mjust another test\x1B[38;2;249;38;114m)\x1B[0m",
      expected:
        "\x1B[38;2;249;38;114m(\x1B[0m\x1B[38;2;248;248;242mjust\nanother\ntest\x1B[38;2;249;38;114m)\x1B[0m",
      limit: 3,
      keepNewlines: true,
    },
  ];

  testCases.forEach((tc, i) => {
    it(`Test ${String(i)}: ${tc.description}`, () => {
      const w = new WordWrapWriter(tc.limit, { keepNewlines: tc.keepNewlines });
      w.write(tc.input);
      w.close();
      expect(w.toString()).toBe(tc.expected);
    });
  });

  it("should wrap string using wordwrap function", () => {
    expect(wordwrap("foo bar", 3)).toBe("foo\nbar");
  });

  it("should handle empty strings", () => {
    expect(wordwrap("", 10)).toBe("");
  });

  it("should preserve ANSI codes across multiple writes", () => {
    const w = new WordWrapWriter(10);
    w.write("\x1B[31mred");
    w.write(" text\x1B[0m");
    w.close();
    expect(w.toString()).toBe("\x1B[31mred text\x1B[0m");
  });

  it("should handle custom breakpoints", () => {
    const w = new WordWrapWriter(5, { breakpoints: [".", "-"] });
    w.write("foo.bar-baz");
    w.close();
    expect(w.toString()).toBe("foo.\nbar-\nbaz");
  });

  it("should handle custom newline characters", () => {
    const w = new WordWrapWriter(10, { newline: ["\r", "\n"] });
    w.write("foo\rbar\nbaz");
    w.close();
    expect(w.toString()).toBe("foo\nbar\nbaz");
  });
});
