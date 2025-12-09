/**
 * Tests for ANSI utility functions
 */

import { describe, it, expect } from "vitest";
import { ansi } from "@/index";
const { Marker, isTerminator, printableRuneWidth } = ansi;

describe("ansi", () => {
  describe("Marker", () => {
    it("should be the ESC character", () => {
      expect(Marker).toBe("\x1B");
      expect(Marker.charCodeAt(0)).toBe(0x1B);
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
      expect(printableRuneWidth("\x1B[31mRed\x1B[0m \x1B[32mGreen\x1B[0m")).toBe(9); // "Red Green"
    });

    it("should handle complex ANSI sequences", () => {
      // RGB color
      const coloredText = "\x1B[38;2;249;38;114mfoo\x1B[0m";
      expect(printableRuneWidth(coloredText)).toBe(3);
    });

    it("should handle text with ANSI sequences and spaces", () => {
      const text = "\x1B[38;2;249;38;114mfoo\x1B[0m\x1B[38;2;248;248;242m \x1B[0m\x1B[38;2;230;219;116mbar\x1B[0m";
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
