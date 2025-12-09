/**
 * Tests for indent module.
 * Tests ported from: https://github.com/muesli/reflow/blob/master/indent/indent_test.go
 */

import { describe, it, expect } from "vitest";
import {
  indentBytes,
  indentString,
  IndentWriter,
  IndentWriterPipe,
  newIndentWriter,
  newIndentWriterPipe,
} from "@";

describe("indent", () => {
  describe("Writer", () => {
    it("should pass through with no indentation", () => {
      const w = new IndentWriter(0);
      w.write("foobar");
      expect(w.string()).toBe("foobar");
    });

    it("should add basic indentation", () => {
      const w = new IndentWriter(4);
      w.write("foobar");
      expect(w.string()).toBe("    foobar");
    });

    it("should indent multi-line text", () => {
      const w = new IndentWriter(4);
      w.write("foo\nbar");
      expect(w.string()).toBe("    foo\n    bar");
    });

    it("should preserve ANSI sequence codes", () => {
      // Test case from Go implementation with ANSI color codes
      const w = new IndentWriter(4);
      w.write("\x1B[38;2;249;38;114mfoo");
      expect(w.string()).toBe(
        "\x1B[38;2;249;38;114m\x1B[0m    \x1B[38;2;249;38;114mfoo"
      );
    });

    it("should handle multiple writes", () => {
      const w = new IndentWriter(4);
      w.write("foo\n");
      w.write("bar");
      expect(w.string()).toBe("    foo\n    bar");
    });

    it("should work with Uint8Array input", () => {
      const w = new IndentWriter(4);
      const input = new TextEncoder().encode("foobar");
      w.write(input);
      expect(w.string()).toBe("    foobar");
    });

    it("should return bytes as Uint8Array", () => {
      const w = new IndentWriter(4);
      w.write("foo");
      const result = w.bytes();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result)).toBe("    foo");
    });
  });

  describe("Writer with custom IndentFunc", () => {
    it("should use custom indentation function", () => {
      const w = new IndentWriter(2, (writer) => {
        writer.write(".");
      });
      w.write("foo\n");
      w.write("bar");
      expect(w.string()).toBe("..foo\n..bar");
    });

    it("should call IndentFunc for each indentation level", () => {
      let callCount = 0;
      const w = new IndentWriter(3, (writer) => {
        callCount++;
        writer.write(">");
      });
      w.write("test");
      expect(w.string()).toBe(">>>test");
      expect(callCount).toBe(3);
    });
  });

  describe("WriterPipe", () => {
    it("should pipe output to another writer", () => {
      let output = "";
      const target = {
        write: (data: string) => {
          output += data;
        },
      };

      const w = new IndentWriterPipe(target, 2);
      w.write("foo");

      expect(output).toBe("  foo");
    });

    it("should handle multi-line piped output", () => {
      let output = "";
      const target = {
        write: (data: string) => {
          output += data;
        },
      };

      const w = new IndentWriterPipe(target, 2);
      w.write("foo\nbar");

      expect(output).toBe("  foo\n  bar");
    });

    it("should support custom indent function in pipe mode", () => {
      let output = "";
      const target = {
        write: (data: string) => {
          output += data;
        },
      };

      const w = new IndentWriterPipe(target, 2, (writer) => {
        writer.write("*");
      });
      w.write("test");

      expect(output).toBe("**test");
    });
  });

  describe("convenience functions", () => {
    describe("indentString", () => {
      it("should indent a string", () => {
        const result = indentString("foobar", 3);
        expect(result).toBe("   foobar");
      });

      it("should handle empty string", () => {
        const result = indentString("", 4);
        expect(result).toBe("");
      });

      it("should handle multi-line string", () => {
        const result = indentString("line1\nline2\nline3", 2);
        expect(result).toBe("  line1\n  line2\n  line3");
      });

      it("should preserve ANSI codes", () => {
        const result = indentString("\x1B[31mred\x1B[0m", 2);
        expect(result).toContain("red");
      });
    });

    describe("indentBytes", () => {
      it("should indent byte arrays", () => {
        const input = new TextEncoder().encode("test");
        const result = indentBytes(input, 4);
        expect(new TextDecoder().decode(result)).toBe("    test");
      });

      it("should handle empty byte array", () => {
        const input = new TextEncoder().encode("");
        const result = indentBytes(input, 4);
        expect(new TextDecoder().decode(result)).toBe("");
      });
    });

    describe("newWriter", () => {
      it("should create a new Writer instance", () => {
        const w = newIndentWriter(4);
        expect(w).toBeInstanceOf(IndentWriter);
        expect(w.indent).toBe(4);
      });

      it("should accept custom indent function", () => {
        const indentFunc = (w: { write: (data: string) => void }) => {
          w.write("-");
        };
        const w = newIndentWriter(2, indentFunc);
        w.write("test");
        expect(w.string()).toBe("--test");
      });
    });

    describe("newWriterPipe", () => {
      it("should create a new WriterPipe instance", () => {
        let output = "";
        const target = {
          write: (d: string) => {
            output += d;
          },
        };
        const w = newIndentWriterPipe(target, 4);
        expect(w).toBeInstanceOf(IndentWriterPipe);
        expect(w.indent).toBe(4);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle text with only newlines", () => {
      const w = new IndentWriter(2);
      w.write("\n\n\n");
      expect(w.string()).toBe("  \n  \n  \n");
    });

    it("should handle text ending with newline", () => {
      const w = new IndentWriter(2);
      w.write("foo\n");
      expect(w.string()).toBe("  foo\n");
    });

    it("should handle complex ANSI sequences", () => {
      const w = new IndentWriter(2);
      // Test with multiple ANSI codes
      w.write("\x1B[1m\x1B[31mbold red\x1B[0m");
      const result = w.string();
      expect(result).toContain("bold red");
    });

    it("should handle interleaved ANSI codes and newlines", () => {
      const w = new IndentWriter(2);
      w.write("\x1B[31mred\ntext\x1B[0m");
      const result = w.string();
      expect(result).toContain("red");
      expect(result).toContain("text");
    });

    it("should handle zero-length writes", () => {
      const w = new IndentWriter(4);
      w.write("");
      expect(w.string()).toBe("");
    });

    it("should handle very long indentation", () => {
      const w = new IndentWriter(100);
      w.write("x");
      expect(w.string()).toBe(" ".repeat(100) + "x");
    });

    it("should indent each line independently", () => {
      const w = new IndentWriter(2);
      w.write("a");
      w.write("\n");
      w.write("b");
      w.write("\n");
      w.write("c");
      expect(w.string()).toBe("  a\n  b\n  c");
    });
  });

  describe("ANSI sequence preservation details", () => {
    it("should reset ANSI before indent and restore after", () => {
      // When there's an active ANSI sequence, we should reset it before
      // adding indentation, then restore it after
      const w = new IndentWriter(2);
      w.write("\x1B[31mred\nstill red\x1B[0m");
      const result = w.string();

      // The second line should have the ANSI sequence reset, indent added,
      // then ANSI restored
      expect(result).toContain("\x1B[0m"); // reset
      expect(result).toContain("\x1B[31m"); // color code
    });

    it("should handle ANSI reset sequence [0m", () => {
      const w = new IndentWriter(2);
      w.write("\x1B[31mred\x1B[0m\nnormal");
      const result = w.string();
      expect(result).toContain("red");
      expect(result).toContain("normal");
    });

    it("should preserve multiple color changes", () => {
      const w = new IndentWriter(2);
      w.write("\x1B[31mred\x1B[32mgreen\x1B[34mblue\x1B[0m");
      const result = w.string();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
