import { describe, it, expect } from "vitest";
import {
  ANSI_MARKER,
  ANSI_RESET,
  isAnsiTerminator,
  printableRuneWidth,
  stripAnsi,
  AnsiBuffer,
  AnsiPassthrough,
} from "@";

describe("ANSI utilities", () => {
  describe("constants", () => {
    it("ANSI_MARKER should be the ESC character", () => {
      expect(ANSI_MARKER).toBe("\x1B");
      expect(ANSI_MARKER.charCodeAt(0)).toBe(0x1b);
    });

    it("ANSI_RESET should be the reset sequence", () => {
      expect(ANSI_RESET).toBe("\x1b[0m");
    });
  });

  describe("isAnsiTerminator", () => {
    it("should recognize uppercase terminators (A-Z)", () => {
      expect(isAnsiTerminator("@")).toBe(true);
      expect(isAnsiTerminator("A")).toBe(true);
      expect(isAnsiTerminator("H")).toBe(true);
      expect(isAnsiTerminator("J")).toBe(true);
      expect(isAnsiTerminator("K")).toBe(true);
      expect(isAnsiTerminator("Z")).toBe(true);
    });

    it("should recognize lowercase terminators (a-z)", () => {
      expect(isAnsiTerminator("a")).toBe(true);
      expect(isAnsiTerminator("m")).toBe(true);
      expect(isAnsiTerminator("z")).toBe(true);
    });

    it("should not recognize non-terminators", () => {
      expect(isAnsiTerminator("0")).toBe(false);
      expect(isAnsiTerminator("9")).toBe(false);
      expect(isAnsiTerminator(";")).toBe(false);
      expect(isAnsiTerminator("[")).toBe(false);
      expect(isAnsiTerminator(" ")).toBe(false);
    });
  });

  describe("printableRuneWidth", () => {
    it("should return 0 for empty string", () => {
      expect(printableRuneWidth("")).toBe(0);
    });

    it("should calculate width of ASCII text", () => {
      expect(printableRuneWidth("hello")).toBe(5);
      expect(printableRuneWidth("a")).toBe(1);
    });

    it("should ignore ANSI escape sequences", () => {
      expect(printableRuneWidth("\x1B[31mHello\x1B[0m")).toBe(5);
      expect(printableRuneWidth("\x1B[31mRed\x1B[0m \x1B[32mGreen\x1B[0m")).toBe(
        9
      );
    });

    it("should handle complex ANSI sequences", () => {
      const coloredText = "\x1B[38;2;249;38;114mfoo\x1B[0m";
      expect(printableRuneWidth(coloredText)).toBe(3);
    });

    it("should handle wide characters correctly", () => {
      expect(printableRuneWidth("中文")).toBe(4);
      expect(printableRuneWidth("日本語")).toBe(6);
    });

    it("should handle mixed ASCII and wide characters", () => {
      expect(printableRuneWidth("Hello世界")).toBe(9);
    });

    it("should handle wide characters with ANSI", () => {
      expect(printableRuneWidth("\x1B[31m中文\x1B[0m")).toBe(4);
    });

    it("should handle emoji", () => {
      expect(printableRuneWidth("😀a")).toBe(3);
    });
  });

  describe("stripAnsi", () => {
    it("should remove ANSI sequences", () => {
      expect(stripAnsi("\x1B[31mred\x1B[0m")).toBe("red");
      expect(stripAnsi("\x1B[1m\x1B[31mbold red\x1B[0m")).toBe("bold red");
    });

    it("should return plain text unchanged", () => {
      expect(stripAnsi("hello")).toBe("hello");
    });
  });

  describe("AnsiBuffer", () => {
    it("tracks last sequence and writes reset when requested", () => {
      const w = new AnsiBuffer();
      w.write("\x1b[31mred");
      expect(w.toString()).toBe("\x1b[31mred");
      expect(w.getLastSequence()).toBe("\x1b[31m");

      w.resetAnsi();
      expect(w.toString()).toBe("\x1b[31mred\x1b[0m");
    });

    it("does not reset when no sequence changes occurred", () => {
      const w = new AnsiBuffer();
      w.write("\x1b[31mred\x1b[0m");
      w.resetAnsi();
      expect(w.toString()).toBe("\x1b[31mred\x1b[0m");
      expect(w.getLastSequence()).toBe("");
    });

    it("remembers the last non-reset ANSI sequence", () => {
      const w = new AnsiBuffer();
      w.write("\x1b[31mred\x1b[32mgreen");
      expect(w.getLastSequence()).toBe("\x1b[32m");
    });
  });

  describe("AnsiPassthrough", () => {
    it("passes through plain text", () => {
      let out = "";
      const target = {
        write: (d: string) => {
          out += d;
        },
      };
      const w = new AnsiPassthrough(target);
      w.write("hello");
      expect(out).toBe("hello");
    });

    it("resets and restores ANSI sequences", () => {
      let out = "";
      const target = {
        write: (d: string) => {
          out += d;
        },
      };
      const w = new AnsiPassthrough(target);
      w.write("\x1b[31mred");
      w.resetAnsi();
      w.restoreAnsi();
      expect(out).toBe("\x1b[31mred\x1b[0m\x1b[31m");
      expect(w.getLastSequence()).toBe("\x1b[31m");
    });

    it("clears last sequence when a reset code is written", () => {
      let out = "";
      const target = {
        write: (d: string) => {
          out += d;
        },
      };
      const w = new AnsiPassthrough(target);
      w.write("\x1b[31mred\x1b[0m");
      expect(w.getLastSequence()).toBe("");
      w.resetAnsi();
      expect(out).toBe("\x1b[31mred\x1b[0m");
    });
  });
});
