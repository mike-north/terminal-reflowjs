# terminal-reflowjs

ANSI-aware text reflow utilities for terminal applications.

A TypeScript port of [muesli/reflow](https://github.com/muesli/reflow), providing text wrapping, truncation, padding, indentation, and more—all while correctly preserving ANSI escape sequences for colors and styles.

## Installation

```bash
npm install terminal-reflowjs
# or
pnpm add terminal-reflowjs
# or
yarn add terminal-reflowjs
```

## Features

- **Word wrap** — Wrap text at word boundaries (spaces, hyphens)
- **Hard wrap** — Wrap text at exact character limits
- **Truncate** — Shorten text with optional ellipsis
- **Indent** — Add leading spaces to each line
- **Dedent** — Remove common leading whitespace
- **Pad** — Add trailing spaces to reach a width
- **Margin** — Add top/bottom/left/right margins
- **ANSI-aware** — All operations correctly handle escape sequences
- **Wide character support** — Correctly measures CJK and emoji

## Quick Start

```typescript
import { wordwrap, truncate, indent, pad } from 'terminal-reflowjs';

// Word-wrap to 40 columns
const wrapped = wordwrap("The quick brown fox jumps over the lazy dog", 20);
// "The quick brown fox\njumps over the lazy\ndog"

// Truncate with ellipsis
const short = truncate("Hello World", 8, { tail: "..." });
// "Hello..."

// Indent by 4 spaces
const indented = indent("line 1\nline 2", 4);
// "    line 1\n    line 2"

// Pad lines to fixed width
const padded = pad("hi", 10);
// "hi        "
```

## API

### Functions

| Function | Description |
|----------|-------------|
| `wordwrap(s, limit, options?)` | Wrap at word boundaries |
| `hardwrap(s, limit, options?)` | Wrap at exact character limits |
| `truncate(s, width, options?)` | Shorten with optional tail |
| `indent(s, spaces, options?)` | Add leading indentation |
| `dedent(s)` | Remove common leading whitespace |
| `pad(s, width, options?)` | Add trailing padding |
| `margin(s, options)` | Add margins around text |

### Streaming Writers

For processing text incrementally, use the writer classes:

```typescript
import { WordWrapWriter } from 'terminal-reflowjs';

const writer = new WordWrapWriter(40);
writer.write("chunk 1 ");
writer.write("chunk 2 ");
writer.write("chunk 3");
writer.close();
console.log(writer.toString());
```

Available writers: `WordWrapWriter`, `HardWrapWriter`, `TruncateWriter`, `IndentWriter`, `PadWriter`, `MarginWriter`

### ANSI Utilities

```typescript
import { 
  printableRuneWidth,  // Get visible width (ignoring ANSI codes)
  stripAnsi,           // Remove all ANSI sequences
  isAnsiTerminator,    // Check if char terminates an ANSI sequence
  ANSI_MARKER,         // ESC character (0x1B)
  ANSI_RESET           // Reset sequence (\x1b[0m)
} from 'terminal-reflowjs';

// Measure visible width
printableRuneWidth("\x1b[31mred\x1b[0m");  // 3

// Strip colors
stripAnsi("\x1b[31mred\x1b[0m");  // "red"
```

## Examples

### Word Wrap with ANSI Colors

```typescript
import { wordwrap } from 'terminal-reflowjs';

const colored = "\x1b[31mRed text\x1b[0m and \x1b[32mgreen text\x1b[0m";
console.log(wordwrap(colored, 15));
// Colors are preserved across line breaks
```

### Custom Breakpoints

```typescript
import { WordWrapWriter } from 'terminal-reflowjs';

const writer = new WordWrapWriter(20, {
  breakpoints: [' ', '-', '/'],  // Also break on slashes
  keepNewlines: true
});
```

### Hard Wrap for Strict Width

```typescript
import { hardwrap } from 'terminal-reflowjs';

// When you absolutely need lines to fit
const strict = hardwrap("Supercalifragilisticexpialidocious", 10);
// "Supercalif\nragilistic\nexpialidoc\nious"
```

### Truncate Long Titles

```typescript
import { truncate } from 'terminal-reflowjs';

const title = "This is a very long title that needs shortening";
console.log(truncate(title, 20, { tail: "…" }));
// "This is a very lon…"
```

### Remove Indentation

```typescript
import { dedent } from 'terminal-reflowjs';

const code = `
    function hello() {
        console.log("hi");
    }
`;
console.log(dedent(code));
// Removes the common 4-space indent
```

### Add Margins

```typescript
import { margin } from 'terminal-reflowjs';

const boxed = margin("Hello", { 
  top: 1, 
  bottom: 1, 
  left: 4, 
  right: 4 
});
```

## Full API Documentation

See the complete [API Reference](./docs/terminal-reflowjs.md) for detailed documentation of all functions, classes, and options.

## Credits

This library is a TypeScript port of [muesli/reflow](https://github.com/muesli/reflow), an excellent Go library by [Christian Muehlhaeuser](https://github.com/muesli). All credit for the original algorithms and design goes to that project.

## License

MIT

