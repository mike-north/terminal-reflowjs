import { describe, it, expect } from "vitest";
import { strip, printableLength } from "@/ansi";

describe("ansi", () => {
  describe("strip", () => {
    it("should strip ANSI color codes", () => {
      const input = "\x1B[38;2;249;38;114mfoo\x1B[0m";
      const result = strip(input);
      expect(result).toBe("foo");
    });

    it("should handle text without ANSI codes", () => {
      const result = strip("plain text");
      expect(result).toBe("plain text");
    });

    it("should strip multiple ANSI codes", () => {
      const input = "\x1B[1m\x1B[31mred and bold\x1B[0m";
      const result = strip(input);
      expect(result).toBe("red and bold");
    });

    it("should handle empty string", () => {
      const result = strip("");
      expect(result).toBe("");
    });
  });

  describe("printableLength", () => {
    it("should return length without ANSI codes", () => {
      const input = "\x1B[38;2;249;38;114mfoo\x1B[0m";
      expect(printableLength(input)).toBe(3);
    });

    it("should return correct length for plain text", () => {
      expect(printableLength("hello world")).toBe(11);
    });

    it("should handle empty string", () => {
      expect(printableLength("")).toBe(0);
    });

    it("should handle text with multiple ANSI codes", () => {
      const input = "\x1B[1m\x1B[31mred\x1B[0m and \x1B[32mgreen\x1B[0m";
      expect(printableLength(input)).toBe(13); // "red and green"
    });
  });
});
