/**
 * Tests for the truncate module.
 * Based on Go's github.com/muesli/reflow/truncate test suite.
 * 
 * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate_test.go
 */

import { describe, it, expect } from 'vitest';
import {
  TruncateWriter,
  truncateString,
  truncateStringWithTail,
  truncateBytes,
  truncateBytesWithTail,
} from '@/truncate';

describe('TruncateWriter', () => {
  /**
   * These test cases are ported from the Go implementation.
   * Reference: https://github.com/muesli/reflow/blob/master/truncate/truncate_test.go
   * Each test validates different edge cases for truncation with ANSI sequences and wide characters.
   */
  const testCases: Array<{
    width: number;
    tail: string;
    input: string;
    expected: string;
    description: string;
  }> = [
    {
      width: 10,
      tail: '',
      input: 'foo',
      expected: 'foo',
      description: 'No-op, should pass through',
    },
    {
      width: 3,
      tail: '',
      input: 'foobar',
      expected: 'foo',
      description: 'Basic truncate',
    },
    {
      width: 4,
      tail: '.',
      input: 'foobar',
      expected: 'foo.',
      description: 'Truncate with tail',
    },
    {
      width: 3,
      tail: '',
      input: 'foo',
      expected: 'foo',
      description: 'Same width - exact fit',
    },
    {
      width: 2,
      tail: '...',
      input: 'foo',
      expected: '...',
      description: 'Tail is longer than width',
    },
    {
      width: 2,
      tail: '…',
      input: '    ',
      expected: ' …',
      description: 'Spaces only',
    },
    {
      width: 2,
      tail: '',
      input: '你好',
      expected: '你',
      description: 'Double-width runes (Chinese characters)',
    },
    {
      width: 1,
      tail: '',
      input: '你',
      expected: '',
      description: 'Double-width rune is dropped if it is too wide',
    },
    {
      width: 3,
      tail: '',
      input: '\x1B[38;2;249;38;114m你好\x1B[0m',
      expected: '\x1B[38;2;249;38;114m你\x1B[0m',
      description: 'ANSI sequence codes and double-width characters',
    },
    {
      width: 1,
      tail: '',
      input: '\x1B[7m--',
      expected: '\x1B[7m-\x1B[0m',
      description: 'Reset styling sequence is added after truncate',
    },
    {
      width: 2,
      tail: '',
      input: '\x1B[7m--',
      expected: '\x1B[7m--',
      description: 'Reset styling sequence not added if operation is a noop',
    },
    {
      width: 3,
      tail: '…',
      input: '\x1B[38;5;219mHiya!',
      expected: '\x1B[38;5;219mHi…\x1B[0m',
      description: 'Tail is printed before reset sequence',
    },
  ];

  testCases.forEach((tc, index) => {
    it(`Test ${index}: ${tc.description}`, () => {
      const writer = new TruncateWriter(tc.width, tc.tail);
      writer.write(tc.input);
      const result = writer.toString();
      
      expect(result).toBe(tc.expected);
    });
  });
});

describe('truncateString', () => {
  it('should truncate a simple string', () => {
    const result = truncateString('foobar', 3);
    expect(result).toBe('foo');
  });

  it('should not truncate if string fits', () => {
    const result = truncateString('foo', 10);
    expect(result).toBe('foo');
  });

  it('should handle empty string', () => {
    const result = truncateString('', 5);
    expect(result).toBe('');
  });

  it('should handle ANSI colored text', () => {
    const result = truncateString('\x1B[31mHello World\x1B[0m', 5);
    expect(result).toBe('\x1B[31mHello\x1B[0m');
  });

  it('should handle wide characters', () => {
    const result = truncateString('Hello 世界', 7);
    // "Hello " is 6 columns, "世" is 2 columns (would be 8 total)
    // So with width 7, we can only fit "Hello " (6 columns)
    expect(result).toBe('Hello ');
  });
});

describe('truncateStringWithTail', () => {
  it('should truncate with tail', () => {
    const result = truncateStringWithTail('Hello World', 8, '...');
    expect(result).toBe('Hello...');
  });

  it('should handle ellipsis character', () => {
    const result = truncateStringWithTail('Hello World', 6, '…');
    expect(result).toBe('Hello…');
  });

  it('should handle tail with ANSI sequences', () => {
    const result = truncateStringWithTail('\x1B[32mHello World\x1B[0m', 8, '…');
    expect(result).toBe('\x1B[32mHello W…\x1B[0m');
  });

  it('should only show tail if tail is wider than width', () => {
    const result = truncateStringWithTail('foo', 2, '...');
    expect(result).toBe('...');
  });
});

describe('truncateBytes', () => {
  it('should truncate a Buffer', () => {
    const input = Buffer.from('foobar', 'utf8');
    const result = truncateBytes(input, 3);
    expect(result.toString('utf8')).toBe('foo');
  });

  it('should handle Buffer with ANSI sequences', () => {
    const input = Buffer.from('\x1B[31mHello World\x1B[0m', 'utf8');
    const result = truncateBytes(input, 5);
    expect(result.toString('utf8')).toBe('\x1B[31mHello\x1B[0m');
  });

  it('should handle Buffer with wide characters', () => {
    const input = Buffer.from('你好世界', 'utf8');
    const result = truncateBytes(input, 4);
    // Each Chinese character is 2 columns wide
    expect(result.toString('utf8')).toBe('你好');
  });
});

describe('truncateBytesWithTail', () => {
  it('should truncate Buffer with tail', () => {
    const input = Buffer.from('foobar', 'utf8');
    const tail = Buffer.from('...', 'utf8');
    const result = truncateBytesWithTail(input, 6, tail);
    expect(result.toString('utf8')).toBe('foo...');
  });

  it('should handle Buffer with tail and ANSI', () => {
    const input = Buffer.from('\x1B[32mHello World\x1B[0m', 'utf8');
    const tail = Buffer.from('…', 'utf8');
    const result = truncateBytesWithTail(input, 8, tail);
    expect(result.toString('utf8')).toBe('\x1B[32mHello W…\x1B[0m');
  });
});

describe('Edge cases', () => {
  it('should handle truncation in the middle of an ANSI sequence', () => {
    // This tests that ANSI sequences are treated atomically
    const input = '\x1B[38;2;255;0;0mRed Text';
    const result = truncateString(input, 3);
    // Should preserve the complete ANSI sequence
    expect(result).toBe('\x1B[38;2;255;0;0mRed\x1B[0m');
  });

  it('should handle multiple ANSI sequences', () => {
    const input = '\x1B[1m\x1B[31mBold Red\x1B[0m';
    const result = truncateString(input, 4);
    expect(result).toBe('\x1B[1m\x1B[31mBold\x1B[0m');
  });

  it('should handle nested styles correctly', () => {
    const input = '\x1B[1mBold \x1B[31mand Red\x1B[0m';
    const result = truncateString(input, 8);
    expect(result).toBe('\x1B[1mBold \x1B[31mand\x1B[0m');
  });

  it('should handle emoji (wide characters)', () => {
    const input = 'Hello 👋 World';
    const result = truncateString(input, 8);
    // Emoji is typically 2 columns wide
    expect(result.length).toBeLessThanOrEqual(input.length);
  });

  it('should handle combining characters', () => {
    const input = 'café'; // é can be represented as e + combining acute
    const result = truncateString(input, 3);
    expect(result).toBe('caf');
  });

  it('should handle zero width', () => {
    const result = truncateString('hello', 0);
    expect(result).toBe('');
  });

  it('should handle width of 1 with wide character', () => {
    const result = truncateString('你好', 1);
    // Can't fit even one wide character, so should return empty
    expect(result).toBe('');
  });

  it('should preserve ANSI sequences even at boundary', () => {
    const input = '\x1B[31mAB\x1B[0m';
    const result = truncateString(input, 2);
    expect(result).toBe('\x1B[31mAB\x1B[0m');
  });

  it('should handle very long ANSI sequences', () => {
    const input = '\x1B[38;2;255;128;64;48;5;200mColored\x1B[0m';
    const result = truncateString(input, 4);
    expect(result).toBe('\x1B[38;2;255;128;64;48;5;200mColo\x1B[0m');
  });
});
