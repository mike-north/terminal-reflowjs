import { describe, it, expect } from "vitest";
import { ansi } from "@/index";

describe("ansi utilities", () => {
  it("exposes marker and reset constants", () => {
    expect(ansi.ANSI_MARKER).toBe("\x1B");
    expect(ansi.MARKER).toBe("\x1B");
    expect(ansi.Marker).toBe("\x1B");
    expect(ansi.ANSI_RESET).toBe("\x1b[0m");
  });

  it("detects ANSI terminators", () => {
    expect(ansi.isTerminator("A")).toBe(true);
    expect(ansi.isAnsiTerminator("z")).toBe(true);
    expect(ansi.isTerminator("[")).toBe(false);
  });

  it("calculates printable width while ignoring ANSI sequences", () => {
    expect(ansi.printableRuneWidth("plain")).toBe(5);
    expect(ansi.printableRuneWidth("\x1b[31mred\x1b[0m")).toBe(3);
    expect(ansi.printableRuneWidth("😀a")).toBe(3); // emoji counts as width 2
  });

  describe("AnsiWriter", () => {
    it("tracks last sequence and writes reset when requested", () => {
      const w = new ansi.AnsiWriter();
      w.write("\x1b[31mred");
      expect(w.toString()).toBe("\x1b[31mred");
      expect(w.getLastSequence()).toBe("\x1b[31m");

      w.resetAnsi();
      expect(w.toString()).toBe("\x1b[31mred\x1b[0m");
    });

    it("does not reset when no sequence changes occurred", () => {
      const w = new ansi.AnsiWriter();
      w.write("\x1b[31mred\x1b[0m");
      w.resetAnsi();
      expect(w.toString()).toBe("\x1b[31mred\x1b[0m");
      expect(w.getLastSequence()).toBe("");
    });

    it("remembers the last non-reset ANSI sequence", () => {
      const w = new ansi.AnsiWriter();
      w.write("\x1b[31mred\x1b[32mgreen");
      expect(w.getLastSequence()).toBe("\x1b[32m");
    });
  });

  describe("Writer (forwarding)", () => {
    it("passes through plain text", () => {
      let out = "";
      const target = { write: (d: string) => { out += d; } };
      const w = new ansi.Writer(target);
      w.write("hello");
      expect(out).toBe("hello");
    });

    it("resets and restores ANSI sequences around indentation", () => {
      let out = "";
      const target = { write: (d: string) => { out += d; } };
      const w = new ansi.Writer(target);
      w.write("\x1b[31mred");
      w.resetAnsi();
      w.restoreAnsi();
      expect(out).toBe("\x1b[31mred\x1b[0m\x1b[31m");
      expect(w.lastSequence()).toBe("\x1b[31m");
    });

    it("clears last sequence when a reset code is written", () => {
      let out = "";
      const target = { write: (d: string) => { out += d; } };
      const w = new ansi.Writer(target);
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
      expect(ansi.Marker).toBe("\x1B");
      expect(ansi.Marker.charCodeAt(0)).toBe(0x1B);
    });
  });

  describe("isTerminator", () => {
    it("should recognize uppercase ANSI terminators", () => {
      // Common terminators in range 0x40-0x5A
      expect(ansi.isTerminator("@")).toBe(true); // 0x40
      expect(ansi.isTerminator("A")).toBe(true);
      expect(ansi.isTerminator("H")).toBe(true); // CUP
      expect(ansi.isTerminator("J")).toBe(true); // ED
      expect(ansi.isTerminator("K")).toBe(true); // EL
      expect(ansi.isTerminator("Z")).toBe(true); // 0x5A
    });

    it("should recognize lowercase ANSI terminators", () => {
      // Common terminators in range 0x61-0x7A
      expect(ansi.isTerminator("a")).toBe(true); // 0x61
      expect(ansi.isTerminator("m")).toBe(true); // SGR (most common - colors)
      expect(ansi.isTerminator("z")).toBe(true); // 0x7A
    });

    it("should not recognize non-terminators", () => {
      expect(ansi.isTerminator("0")).toBe(false);
      expect(ansi.isTerminator("9")).toBe(false);
      expect(ansi.isTerminator(";")).toBe(false);
      expect(ansi.isTerminator("[")).toBe(false);
      expect(ansi.isTerminator(" ")).toBe(false);
    });
  });

  describe("printableRuneWidth", () => {
    it("should return 0 for empty string", () => {
      expect(ansi.printableRuneWidth("")).toBe(0);
    });

    it("should calculate width of ASCII text", () => {
      expect(ansi.printableRuneWidth("hello")).toBe(5);
      expect(ansi.printableRuneWidth("a")).toBe(1);
    });

    it("should ignore ANSI escape sequences", () => {
      // Red color sequence
      expect(ansi.printableRuneWidth("\x1B[31mHello\x1B[0m")).toBe(5);
      
      // Multiple color sequences
      expect(ansi.printableRuneWidth("\x1B[31mRed\x1B[0m \x1B[32mGreen\x1B[0m")).toBe(9); // "Red Green"
    });

    it("should handle complex ANSI sequences", () => {
      // RGB color
      const coloredText = "\x1B[38;2;249;38;114mfoo\x1B[0m";
      expect(ansi.printableRuneWidth(coloredText)).toBe(3);
    });

    it("should handle text with ANSI sequences and spaces", () => {
      const text = "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m";
      expect(ansi.printableRuneWidth(text)).toBe(7); // "foo bar"
    });

    it("should handle wide characters correctly", () => {
      // East Asian wide characters typically take 2 columns
      expect(ansi.printableRuneWidth("中文")).toBe(4); // 2 characters, 2 columns each
      expect(ansi.printableRuneWidth("日本語")).toBe(6); // 3 characters, 2 columns each
    });

    it("should handle mixed ASCII and wide characters", () => {
      expect(ansi.printableRuneWidth("Hello世界")).toBe(9); // 5 + 4
    });

    it("should handle wide characters with ANSI", () => {
      expect(ansi.printableRuneWidth("\x1B[31m中文\x1B[0m")).toBe(4);
    });
  });
});
