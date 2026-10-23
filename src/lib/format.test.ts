import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatCount,
  formatDuration,
  formatRelativeDate,
  safeFileName,
} from './format';

describe('formatCount', () => {
  it('formats thousands, millions and billions', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(2_000_000)).toBe('2M');
    expect(formatCount(1_250_000_000)).toBe('1.3B');
    expect(formatCount(250_000)).toBe('250K');
  });
});

describe('formatDuration', () => {
  it('formats seconds, minutes and hours', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(9)).toBe('0:09');
    expect(formatDuration(75)).toBe('1:15');
    expect(formatDuration(3725)).toBe('1:02:05');
  });
});

describe('formatBytes', () => {
  it('formats file sizes', () => {
    expect(formatBytes(undefined)).toBe('');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('safeFileName', () => {
  it('removes unsafe characters and caps length', () => {
    expect(safeFileName('Hello / World: #TikTok')).toBe('Hello-World-TikTok');
    expect(safeFileName('   ')).toBe('tiktok');
    expect(safeFileName('a'.repeat(120))).toHaveLength(80);
  });
});

describe('formatRelativeDate', () => {
  it('returns an empty string for missing dates', () => {
    expect(formatRelativeDate(0)).toBe('');
  });

  it('formats a unix timestamp in seconds', () => {
    expect(formatRelativeDate(1717541595)).not.toBe('');
  });
});
