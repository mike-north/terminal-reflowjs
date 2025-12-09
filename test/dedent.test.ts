import { describe, it, expect } from "vitest";
import { dedent } from "@";

describe("dedent", () => {
  it("removes common leading spaces", () => {
    const input = "    Hello\n  World";
    expect(dedent(input)).toBe("  Hello\nWorld");
  });

  it("leaves text unchanged when no indentation", () => {
    const input = "Hello\nWorld";
    expect(dedent(input)).toBe(input);
  });

  it("ignores empty lines when computing indentation", () => {
    const input = "\n    foo\n    bar\n";
    expect(dedent(input)).toBe("\nfoo\nbar\n");
  });

  it("handles tabs as indentation", () => {
    const input = "\t\tfoo\n\t\tbar";
    expect(dedent(input)).toBe("foo\nbar");
  });

  it("preserves trailing newline", () => {
    const input = "  foo\n  bar\n";
    expect(dedent(input)).toBe("foo\nbar\n");
  });

  it("handles mixed indentation", () => {
    const input = "    foo\n  \tbar";
    expect(dedent(input)).toBe(" foo\nbar");
  });

  describe("basic dedenting", () => {
    it("should dedent lines with uniform indentation", () => {
      const input =
        "      --help      Show help for command\n      --version   Show version\n";
      const expected =
        "--help      Show help for command\n--version   Show version\n";
      expect(dedent(input)).toBe(expected);
    });

    it("should dedent to minimum indentation", () => {
      const input =
        "      --help              Show help for command\n  -C, --config string   Specify the config file to use\n";
      const expected =
        "    --help              Show help for command\n-C, --config string   Specify the config file to use\n";
      expect(dedent(input)).toBe(expected);
    });

    it("should handle mixed indentation with empty line", () => {
      const input = "  line 1\n\n  line 2\n line 3";
      const expected = " line 1\n\n line 2\nline 3";
      expect(dedent(input)).toBe(expected);
    });

    it("should dedent uniform indentation with trailing empty line", () => {
      const input = "  line 1\n  line 2\n  line 3\n\n";
      const expected = "line 1\nline 2\nline 3\n\n";
      expect(dedent(input)).toBe(expected);
    });
  });

  describe("mixed whitespace", () => {
    it("should handle mixed spaces and tabs - case 1", () => {
      const input = " \tline 1\n\t\tline 2\n\t line 3\n\n";
      const expected = "line 1\nline 2\nline 3\n\n";
      expect(dedent(input)).toBe(expected);
    });

    it("should handle mixed spaces and tabs - case 2", () => {
      const input = "\t\tline 1\n\n\t\tline 2\n\tline 3";
      const expected = "\tline 1\n\n\tline 2\nline 3";
      expect(dedent(input)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle string with only newlines", () => {
      const input = "\n\n\n\n\n\n";
      expect(dedent(input)).toBe(input);
    });

    it("should handle empty string", () => {
      expect(dedent("")).toBe("");
    });

    it("should handle string with no indentation", () => {
      const input = "line 1\nline 2\nline 3";
      expect(dedent(input)).toBe(input);
    });

    it("should handle single line with indentation", () => {
      expect(dedent("    single line")).toBe("single line");
    });

    it("should handle string with only whitespace", () => {
      const input = "    \n    \n    ";
      expect(dedent(input)).toBe(input);
    });
  });

  describe("ANSI escape sequences", () => {
    it("should preserve ANSI escape sequences while dedenting", () => {
      const input = "    \x1B[31mred text\x1B[0m\n    \x1B[32mgreen text\x1B[0m";
      const expected = "\x1B[31mred text\x1B[0m\n\x1B[32mgreen text\x1B[0m";
      expect(dedent(input)).toBe(expected);
    });

    it("should treat ANSI sequences as non-whitespace", () => {
      const input =
        "  \x1B[1m  bold line 1\x1B[0m\n  \x1B[1m  bold line 2\x1B[0m";
      const expected =
        "\x1B[1m  bold line 1\x1B[0m\n\x1B[1m  bold line 2\x1B[0m";
      expect(dedent(input)).toBe(expected);
    });

    it("should handle ANSI sequences at start of line", () => {
      const input =
        "\x1B[31m    red indented text\x1B[0m\n\x1B[32m    green indented text\x1B[0m";
      expect(dedent(input)).toBe(input);
    });

    it("should handle multiple ANSI sequences on one line", () => {
      const input = "    \x1B[31m\x1B[1mred bold\x1B[0m text\n    normal line";
      const expected = "\x1B[31m\x1B[1mred bold\x1B[0m text\nnormal line";
      expect(dedent(input)).toBe(expected);
    });

    it("should handle complex ANSI sequences", () => {
      const input = "    \x1B[38;5;214mtext\x1B[0m\n    more text";
      const expected = "\x1B[38;5;214mtext\x1B[0m\nmore text";
      expect(dedent(input)).toBe(expected);
    });
  });

  describe("tabs", () => {
    it("should handle tabs at the beginning", () => {
      const input = "\t\tline 1\n\t\tline 2";
      expect(dedent(input)).toBe("line 1\nline 2");
    });

    it("should treat tabs and spaces as equal units", () => {
      const input = "  \t\tline 1\n  \t\tline 2";
      expect(dedent(input)).toBe("line 1\nline 2");
    });

    it("should strip whitespace from whitespace-only lines", () => {
      const input = "    line 1\n    \n    line 2";
      const expected = "line 1\n\nline 2";
      expect(dedent(input)).toBe(expected);
    });
  });
});
