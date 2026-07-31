import { describe, it, expect } from 'vitest';
import { formatBytes, formatDuration, resolveAbsolutePath } from '../src/utils/formatters.js';

describe('formatters & utils', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1048576)).toBe('1.00 MB');
    expect(formatBytes(1073741824)).toBe('1.00 GB');
  });

  it('formats duration seconds', () => {
    expect(formatDuration(1500)).toBe('1.50');
    expect(formatDuration(350)).toBe('0.35');
  });

  it('resolves absolute path', () => {
    expect(resolveAbsolutePath('./src')).toContain('src');
    expect(() => resolveAbsolutePath('')).toThrow();
  });
});
