import { describe, it, expect } from "vitest";
import { dedentString } from "@/dedent";

/**
 * Test suite for dedent module
 * Test cases ported from: https://github.com/muesli/reflow/blob/master/dedent/dedent_test.go
 */

describe("dedent", () => {
  describe("basic dedenting", () => {
    it("should dedent lines with uniform indentation", () => {
      const input = "      --help      Show help for command\n      --version   Show version\n";
      const expected = "--help      Show help for command\n--version   Show version\n";
      expect(dedentString(input)).toBe(expected);
    });

    it("should dedent to minimum indentation when lines have different indentation", () => {
      const input = "      --help              Show help for command\n  -C, --config string   Specify the config file to use\n";
      const expected = "    --help              Show help for command\n-C, --config string   Specify the config file to use\n";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle mixed indentation with empty line", () => {
      const input = "  line 1\n\n  line 2\n line 3";
      const expected = " line 1\n\n line 2\nline 3";
      expect(dedentString(input)).toBe(expected);
    });

    it("should dedent uniform indentation with trailing empty line", () => {
      const input = "  line 1\n  line 2\n  line 3\n\n";
      const expected = "line 1\nline 2\nline 3\n\n";
      expect(dedentString(input)).toBe(expected);
    });
  });

  describe("mixed whitespace (spaces and tabs)", () => {
    it("should handle mixed spaces and tabs - case 1", () => {
      const input = " \tline 1\n\t\tline 2\n\t line 3\n\n";
      const expected = "line 1\nline 2\nline 3\n\n";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle mixed spaces and tabs - case 2", () => {
      const input = "\t\tline 1\n\n\t\tline 2\n\tline 3";
      const expected = "\tline 1\n\n\tline 2\nline 3";
      expect(dedentString(input)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle string with only newlines", () => {
      const input = "\n\n\n\n\n\n";
      const expected = "\n\n\n\n\n\n";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle empty string", () => {
      const input = "";
      const expected = "";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle string with no indentation", () => {
      const input = "line 1\nline 2\nline 3";
      const expected = "line 1\nline 2\nline 3";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle single line with indentation", () => {
      const input = "    single line";
      const expected = "single line";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle string with only whitespace", () => {
      const input = "    \n    \n    ";
      const expected = "    \n    \n    ";
      expect(dedentString(input)).toBe(expected);
    });
  });

  describe("ANSI escape sequences", () => {
    // Note: The Go implementation treats ANSI sequences as regular non-whitespace
    // characters, not as special sequences to skip during indentation detection.
    
    it("should preserve ANSI escape sequences while dedenting", () => {
      const input = "    \x1B[31mred text\x1B[0m\n    \x1B[32mgreen text\x1B[0m";
      const expected = "\x1B[31mred text\x1B[0m\n\x1B[32mgreen text\x1B[0m";
      expect(dedentString(input)).toBe(expected);
    });

    it("should treat ANSI sequences as non-whitespace (stops indentation counting)", () => {
      // ANSI sequence appears after 2 spaces, so minIndent is 2
      const input = "  \x1B[1m  bold line 1\x1B[0m\n  \x1B[1m  bold line 2\x1B[0m";
      const expected = "\x1B[1m  bold line 1\x1B[0m\n\x1B[1m  bold line 2\x1B[0m";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle ANSI sequences at start of line (no indentation)", () => {
      const input = "\x1B[31m    red indented text\x1B[0m\n\x1B[32m    green indented text\x1B[0m";
      // ANSI at start means minIndent is 0
      const expected = "\x1B[31m    red indented text\x1B[0m\n\x1B[32m    green indented text\x1B[0m";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle multiple ANSI sequences on one line", () => {
      const input = "    \x1B[31m\x1B[1mred bold\x1B[0m text\n    normal line";
      const expected = "\x1B[31m\x1B[1mred bold\x1B[0m text\nnormal line";
      expect(dedentString(input)).toBe(expected);
    });

    it("should treat ANSI as non-whitespace in minIndent calculation", () => {
      // First line has 2 spaces before ANSI, second line has 4 spaces
      const input = "  \x1B[31mline 1\x1B[0m\n    line 2";
      const expected = "\x1B[31mline 1\x1B[0m\n  line 2";
      expect(dedentString(input)).toBe(expected);
    });

    it("should handle complex ANSI sequences with parameters", () => {
      const input = "    \x1B[38;5;214mtext\x1B[0m\n    more text";
      const expected = "\x1B[38;5;214mtext\x1B[0m\nmore text";
      expect(dedentString(input)).toBe(expected);
    });
  });

  describe("tabs and special cases", () => {
    it("should handle tabs at the beginning", () => {
      const input = "\t\tline 1\n\t\tline 2";
      const expected = "line 1\nline 2";
      expect(dedentString(input)).toBe(expected);
    });

    it("should treat tabs and spaces as equal indentation units", () => {
      // 2 spaces + 2 tabs = 4 units of indentation, all get removed
      const input = "  \t\tline 1\n  \t\tline 2";
      const expected = "line 1\nline 2";
      expect(dedentString(input)).toBe(expected);
    });

    it("should strip whitespace from lines containing only whitespace", () => {
      // Lines with only whitespace get stripped during dedent
      const input = "    line 1\n    \n    line 2";
      const expected = "line 1\n\nline 2";
      expect(dedentString(input)).toBe(expected);
    });
  });
});
