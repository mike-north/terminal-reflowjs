import { describe, it, expect } from "vitest";
import * as reflow from "@";

describe("module exports", () => {
  it("exports primary functions", () => {
    expect(typeof reflow.wordwrap).toBe("function");
    expect(typeof reflow.hardwrap).toBe("function");
    expect(typeof reflow.truncate).toBe("function");
    expect(typeof reflow.indent).toBe("function");
    expect(typeof reflow.dedent).toBe("function");
    expect(typeof reflow.pad).toBe("function");
    expect(typeof reflow.margin).toBe("function");
  });

  it("exports writer classes", () => {
    expect(reflow.WordWrapWriter).toBeDefined();
    expect(reflow.HardWrapWriter).toBeDefined();
    expect(reflow.TruncateWriter).toBeDefined();
    expect(reflow.IndentWriter).toBeDefined();
    expect(reflow.PadWriter).toBeDefined();
    expect(reflow.MarginWriter).toBeDefined();
  });

  it("exports ANSI utilities", () => {
    expect(reflow.ANSI_MARKER).toBe("\x1B");
    expect(reflow.ANSI_RESET).toBe("\x1B[0m");
    expect(typeof reflow.isAnsiTerminator).toBe("function");
    expect(typeof reflow.printableRuneWidth).toBe("function");
    expect(typeof reflow.stripAnsi).toBe("function");
    expect(reflow.AnsiBuffer).toBeDefined();
    expect(reflow.AnsiPassthrough).toBeDefined();
  });
});

