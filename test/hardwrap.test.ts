import { describe, it, expect } from "vitest";
import { hardwrap, HardWrapWriter } from "@";

describe("hardwrap", () => {
  it("wraps text at exact width", () => {
    expect(hardwrap("HelloWorld", 4)).toBe("Hell\noWor\nld");
  });

  it("respects existing newlines", () => {
    expect(hardwrap("foo\nbar", 2)).toBe("fo\no\nba\nr");
  });

  it("ignores ANSI codes when counting width", () => {
    const input = "\x1b[31mred\x1b[0mblue";
    const result = hardwrap(input, 3);
    expect(result).toBe("\x1b[31mred\x1b[0m\nblu\ne");
  });

  it("supports writer interface", () => {
    const writer = new HardWrapWriter(3);
    writer.write("abcdef");
    expect(writer.toString()).toBe("abc\ndef");
  });
});

describe("HardWrapWriter", () => {
  const testCases = [
    {
      name: "No-op, should pass through",
      input: "foobar\n ",
      expected: "foobar\n ",
      limit: 0,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "Nothing to wrap here",
      input: "foo",
      expected: "foo",
      limit: 4,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "Break a long word to obey the limit",
      input: "foobarfoo",
      expected: "foob\narfo\no",
      limit: 4,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "Newlines in the input are respected",
      input: "f\no\nobar",
      expected: "f\no\noba\nr",
      limit: 3,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "Newlines in the input can be ignored",
      input: "f\no\nobar",
      expected: "foo\nbar",
      limit: 3,
      keepNewlines: false,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "Leading whitespaces can be preserved",
      input: "foo bar\n  baz",
      expected: "foo\n ba\nr\n  b\naz",
      limit: 3,
      keepNewlines: true,
      preserveSpace: true,
      tabWidth: 0,
    },
    {
      name: "Leading whitespaces can be removed",
      input: "foo bar\n  baz",
      expected: "foo\nbar\n  b\naz",
      limit: 3,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "Tabs are broken up according to tabWidth",
      input: "foo\tbar",
      expected: "foo \n  ba\nr",
      limit: 4,
      keepNewlines: true,
      preserveSpace: true,
      tabWidth: 3,
    },
    {
      name: "Remaining width of tab is ignored when space not preserved",
      input: "foo\tbar",
      expected: "foo \nbar",
      limit: 4,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 3,
    },
    {
      name: "ANSI sequence codes don't affect length calculation",
      input:
        "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m",
      expected:
        "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m",
      limit: 7,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
    {
      name: "ANSI control codes don't get wrapped",
      input:
        "\x1B[38;2;249;38;114m(\x1B[0m\x1B[38;2;248;248;242mjust another test\x1B[38;2;249;38;114m)\x1B[0m",
      expected:
        "\x1B[38;2;249;38;114m(\x1B[0m\x1B[38;2;248;248;242mju\nst \nano\nthe\nr t\nest\x1B[38;2;249;38;114m\n)\x1B[0m",
      limit: 3,
      keepNewlines: true,
      preserveSpace: false,
      tabWidth: 0,
    },
  ];

  testCases.forEach((tc, i) => {
    it(`Test ${String(i)}: ${tc.name}`, () => {
      const writer = new HardWrapWriter(tc.limit, {
        keepNewlines: tc.keepNewlines,
        preserveSpace: tc.preserveSpace,
        tabWidth: tc.tabWidth,
      });

      writer.write(tc.input);
      expect(writer.toString()).toBe(tc.expected);
    });
  });

  it("should wrap a simple string", () => {
    expect(hardwrap("foo bar", 3)).toBe("foo\nbar");
  });

  it("should handle ANSI colored text", () => {
    const input = "\x1B[31mHello\x1B[0m World";
    const result = hardwrap(input, 8);
    expect(result).toBe("\x1B[31mHello\x1B[0m Wo\nrld");
  });

  it("should respect custom newline character", () => {
    const result = hardwrap("foo bar", 3, { newline: "\r\n" });
    expect(result).toBe("foo\r\nbar");
  });
});

