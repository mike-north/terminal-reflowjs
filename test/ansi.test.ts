import { describe, it, expect } from "vitest";
import {
  ANSI_MARKER,
  ANSI_RESET,
  AnsiWriter,
  AnsiWriterBase,
  isAnsiTerminator,
  isTerminator,
  printableRuneWidth,
} from "@";

describe("ansi utilities", () => {
  it("exposes marker and reset constants", () => {
    expect(ANSI_MARKER).toBe("\x1B");
    expect(ANSI_RESET).toBe("\x1b[0m");
  });

  it("detects ANSI terminators", () => {
    expect(isTerminator("A")).toBe(true);
    expect(isAnsiTerminator("z")).toBe(true);
    expect(isTerminator("[")).toBe(false);
  });

  it("calculates printable width while ignoring ANSI sequences", () => {
    expect(printableRuneWidth("plain")).toBe(5);
    expect(printableRuneWidth("\x1b[31mred\x1b[0m")).toBe(3);
    expect(printableRuneWidth("😀a")).toBe(3); // emoji counts as width 2
  });

  describe("AnsiWriter", () => {
    it("tracks last sequence and writes reset when requested", () => {
      const w = new AnsiWriter();
      w.write("\x1b[31mred");
      expect(w.toString()).toBe("\x1b[31mred");
      expect(w.getLastSequence()).toBe("\x1b[31m");

      w.resetAnsi();
      expect(w.toString()).toBe("\x1b[31mred\x1b[0m");
    });

    it("does not reset when no sequence changes occurred", () => {
      const w = new AnsiWriter();
      w.write("\x1b[31mred\x1b[0m");
      w.resetAnsi();
      expect(w.toString()).toBe("\x1b[31mred\x1b[0m");
      expect(w.getLastSequence()).toBe("");
    });

    it("remembers the last non-reset ANSI sequence", () => {
      const w = new AnsiWriter();
      w.write("\x1b[31mred\x1b[32mgreen");
      expect(w.getLastSequence()).toBe("\x1b[32m");
    });
  });

  describe("Writer (forwarding)", () => {
    it("passes through plain text", () => {
      let out = "";
      const target = {
        write: (d: string) => {
          out += d;
        },
      };
      const w = new AnsiWriterBase(target);
      w.write("hello");
      expect(out).toBe("hello");
    });

    it("resets and restores ANSI sequences around indentation", () => {
      let out = "";
      const target = {
        write: (d: string) => {
          out += d;
        },
      };
      const w = new AnsiWriterBase(target);
      w.write("\x1b[31mred");
      w.resetAnsi();
      w.restoreAnsi();
      expect(out).toBe("\x1b[31mred\x1b[0m\x1b[31m");
      expect(w.lastSequence()).toBe("\x1b[31m");
    });

    it("clears last sequence when a reset code is written", () => {
      let out = "";
      const target = {
        write: (d: string) => {
          out += d;
        },
      };
      const w = new AnsiWriterBase(target);
      w.write("\x1b[31mred\x1b[0m");
      expect(w.lastSequence()).toBe("");
      w.resetAnsi();
      expect(out).toBe("\x1b[31mred\x1b[0m");
    });
  });
});

describe("ansi (additional tests)", () => {
  describe("Marker", () => {
    it("should be the ESC character", () => {
      expect(ANSI_MARKER).toBe("\x1B");
      expect(ANSI_MARKER.charCodeAt(0)).toBe(0x1b);
    });
  });

  describe("isTerminator", () => {
    it("should recognize uppercase ANSI terminators", () => {
      // Common terminators in range 0x40-0x5A
      expect(isTerminator("@")).toBe(true); // 0x40
      expect(isTerminator("A")).toBe(true);
      expect(isTerminator("H")).toBe(true); // CUP
      expect(isTerminator("J")).toBe(true); // ED
      expect(isTerminator("K")).toBe(true); // EL
      expect(isTerminator("Z")).toBe(true); // 0x5A
    });

    it("should recognize lowercase ANSI terminators", () => {
      // Common terminators in range 0x61-0x7A
      expect(isTerminator("a")).toBe(true); // 0x61
      expect(isTerminator("m")).toBe(true); // SGR (most common - colors)
      expect(isTerminator("z")).toBe(true); // 0x7A
    });

    it("should not recognize non-terminators", () => {
      expect(isTerminator("0")).toBe(false);
      expect(isTerminator("9")).toBe(false);
      expect(isTerminator(";")).toBe(false);
      expect(isTerminator("[")).toBe(false);
      expect(isTerminator(" ")).toBe(false);
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
      // Red color sequence
      expect(printableRuneWidth("\x1B[31mHello\x1B[0m")).toBe(5);

      // Multiple color sequences
      expect(
        printableRuneWidth("\x1B[31mRed\x1B[0m \x1B[32mGreen\x1B[0m")
      ).toBe(9); // "Red Green"
    });

    it("should handle complex ANSI sequences", () => {
      // RGB color
      const coloredText = "\x1B[38;2;249;38;114mfoo\x1B[0m";
      expect(printableRuneWidth(coloredText)).toBe(3);
    });

    it("should handle text with ANSI sequences and spaces", () => {
      const text =
        "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m";
      expect(printableRuneWidth(text)).toBe(7); // "foo bar"
    });

    it("should handle wide characters correctly", () => {
      // East Asian wide characters typically take 2 columns
      expect(printableRuneWidth("中文")).toBe(4); // 2 characters, 2 columns each
      expect(printableRuneWidth("日本語")).toBe(6); // 3 characters, 2 columns each
    });

    it("should handle mixed ASCII and wide characters", () => {
      expect(printableRuneWidth("Hello世界")).toBe(9); // 5 + 4
    });

    it("should handle wide characters with ANSI", () => {
      expect(printableRuneWidth("\x1B[31m中文\x1B[0m")).toBe(4);
    });
  });
});
