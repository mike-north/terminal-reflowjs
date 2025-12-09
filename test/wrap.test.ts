/**
 * Tests for the wrap module
 * Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap_test.go
 */

import { describe, it, expect } from "vitest";
import { wrap } from "@/index";
const { Writer, wrapString, wrapBytes, newWriter } = wrap;

describe("wrap (hard wrap)", () => {
  it("wraps text at exact width", () => {
    expect(wrapString("HelloWorld", 4)).toBe("Hell\noWor\nld");
  });

  it("respects existing newlines and resets width", () => {
    expect(wrapString("foo\nbar", 2)).toBe("fo\no\nba\nr");
  });

  it("ignores ANSI codes when counting width", () => {
    const input = "\x1b[31mred\x1b[0mblue";
    const result = wrapString(input, 3);
    expect(result).toBe("\x1b[31mred\x1b[0m\nblu\ne");
  });

  it("supports writer interface", () => {
    const writer = newWriter(3);
    writer.write("abcdef");
    expect(writer.toString()).toBe("abc\ndef");
  });
});

describe("wrap", () => {
  describe("Writer", () => {
    // Test cases adapted from Go test suite
    // Reference: https://github.com/muesli/reflow/blob/master/wrap/wrap_test.go#L9-L140
    const testCases = [
      {
        name: "No-op, should pass through, including trailing whitespace",
        input: "foobar\n ",
        expected: "foobar\n ",
        limit: 0,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "Nothing to wrap here, should pass through",
        input: "foo",
        expected: "foo",
        limit: 4,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "In contrast to wordwrap we break a long word to obey the given limit",
        input: "foobarfoo",
        expected: "foob\narfo\no",
        limit: 4,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "Newlines in the input are respected if desired",
        input: "f\no\nobar",
        expected: "f\no\noba\nr",
        limit: 3,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "Newlines in the input can be ignored if desired",
        input: "f\no\nobar",
        expected: "foo\nbar",
        limit: 3,
        keepNewlines: false,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "Leading whitespaces after forceful line break can be preserved if desired",
        input: "foo bar\n  baz",
        expected: "foo\n ba\nr\n  b\naz",
        limit: 3,
        keepNewlines: true,
        preserveSpace: true,
        tabWidth: 0,
      },
      {
        name: "Leading whitespaces after forceful line break can be removed if desired",
        input: "foo bar\n  baz",
        expected: "foo\nbar\n  b\naz",
        limit: 3,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "Tabs are broken up according to the configured TabWidth",
        input: "foo\tbar",
        expected: "foo \n  ba\nr",
        limit: 4,
        keepNewlines: true,
        preserveSpace: true,
        tabWidth: 3,
      },
      {
        name: "Remaining width of wrapped tab is ignored when space is not preserved",
        input: "foo\tbar",
        expected: "foo \nbar",
        limit: 4,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 3,
      },
      {
        name: "ANSI sequence codes don't affect length calculation",
        input: "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m",
        expected: "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m",
        limit: 7,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
      {
        name: "ANSI control codes don't get wrapped",
        input: "\x1B[38;2;249;38;114m(\x1B[0m\x1B[38;2;248;248;242mjust another test\x1B[38;2;249;38;114m)\x1B[0m",
        expected: "\x1B[38;2;249;38;114m(\x1B[0m\x1B[38;2;248;248;242mju\nst \nano\nthe\nr t\nest\x1B[38;2;249;38;114m\n)\x1B[0m",
        limit: 3,
        keepNewlines: true,
        preserveSpace: false,
        tabWidth: 0,
      },
    ];

    testCases.forEach((tc, i) => {
      it(`Test ${String(i)}: ${tc.name}`, () => {
        const writer = new Writer({
          limit: tc.limit,
          keepNewlines: tc.keepNewlines,
          preserveSpace: tc.preserveSpace,
          tabWidth: tc.tabWidth,
        });

        writer.write(tc.input);
        const result = writer.toString();

        expect(result).toBe(tc.expected);
      });
    });
  });

  describe("wrapString", () => {
    it("should wrap a simple string", () => {
      const result = wrapString("foo bar", 3);
      expect(result).toBe("foo\nbar");
    });

    it("should respect custom options", () => {
      const result = wrapString("foo bar", 3, {
        preserveSpace: true,
      });
      expect(result).toBe("foo\n ba\nr");
    });

    it("should handle ANSI colored text", () => {
      const input = "\x1B[31mHello\x1B[0m World";
      const result = wrapString(input, 8);
      // "Hello World" = 11 characters, wraps at position 8: "Hello Wo" | "rld"
      expect(result).toBe("\x1B[31mHello\x1B[0m Wo\nrld");
    });

    it("should respect custom newline character", () => {
      const result = wrapString("foo bar", 3, {
        newline: "\r\n",
      });
      expect(result).toBe("foo\r\nbar");
    });

    it("should treat each character in newline string as a newline", () => {
      // When newline is "\r\n", both \r and \n in input should be treated as newlines
      const writer = new Writer({
        limit: 10,
        newline: "\r\n",
        keepNewlines: true,
      });
      writer.write("foo\rbar\nbaz");
      // Both \r and \n should trigger new lines
      expect(writer.toString()).toBe("foo\r\nbar\r\nbaz");
    });
  });

  describe("wrapBytes", () => {
    it("should wrap a Buffer", () => {
      const input = Buffer.from("foo bar", "utf-8");
      const result = wrapBytes(input, 3);
      const expected = Buffer.from("foo\nbar", "utf-8");
      
      expect(result.equals(expected)).toBe(true);
    });

    it("should handle ANSI sequences in Buffer", () => {
      const input = Buffer.from("\x1B[31mHello\x1B[0m World", "utf-8");
      const result = wrapBytes(input, 8);
      // "Hello World" = 11 characters, wraps at position 8: "Hello Wo" | "rld"
      const expected = Buffer.from("\x1B[31mHello\x1B[0m Wo\nrld", "utf-8");
      
      expect(result.equals(expected)).toBe(true);
    });
  });
});
