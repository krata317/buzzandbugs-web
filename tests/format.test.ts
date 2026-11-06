import { describe, expect, it } from 'vitest';
import {
  cleanText,
  formatCount,
  formatDateRange,
  formatDuration,
  initials,
  relativeTime,
  truncate,
} from '@/lib/format';

describe('relativeTime', () => {
  const now = Date.UTC(2026, 0, 15, 12, 0, 0);

  it('handles very recent timestamps', () => {
    expect(relativeTime(new Date(now - 20_000).toISOString(), now)).toBe('just now');
  });

  it('formats minutes and hours', () => {
    expect(relativeTime(new Date(now - 5 * 60_000).toISOString(), now)).toBe('5 minutes ago');
    expect(relativeTime(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3 hours ago');
  });

  it('falls back to an absolute date after a week', () => {
    const value = relativeTime(new Date(now - 30 * 86_400_000).toISOString(), now);
    expect(value).toMatch(/2025/);
  });

  it('returns an empty string for invalid input', () => {
    expect(relativeTime('not-a-date', now)).toBe('');
  });
});

describe('formatCount', () => {
  it('keeps small numbers plain', () => {
    expect(formatCount(42)).toBe('42');
    expect(formatCount(0)).toBe('0');
    expect(formatCount(null)).toBe('0');
  });

  it('compacts thousands', () => {
    expect(formatCount(1500)).toBe('1.5K');
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration(600)).toBe('10m');
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(null)).toBeNull();
  });
});

describe('formatDateRange', () => {
  it('describes a same-day range', () => {
    const value = formatDateRange('2026-03-14T09:00:00.000Z', '2026-03-14T17:00:00.000Z');
    expect(value).toContain('–');
  });

  it('handles missing dates', () => {
    expect(formatDateRange(null, null)).toBe('Date to be announced');
    expect(formatDateRange(null, '2026-03-14T17:00:00.000Z')).toMatch(/^Ends/);
  });
});

describe('cleanText', () => {
  it('strips markup and collapses whitespace', () => {
    expect(cleanText('<p>hello   world</p>')).toBe('hello world');
  });

  it('decodes entities before stripping tags', () => {
    expect(cleanText('&lt;a href="x"&gt;read&lt;/a&gt;')).toBe('read');
  });

  it('returns an empty string for null', () => {
    expect(cleanText(null)).toBe('');
  });
});

describe('initials', () => {
  it('uses the first and last word', () => {
    expect(initials('Grace Brewster Hopper')).toBe('GH');
    expect(initials('Ada')).toBe('AD');
    expect(initials('   ')).toBe('?');
  });
});

describe('truncate', () => {
  it('adds an ellipsis only when needed', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('a longer string', 8)).toBe('a longe…');
  });
});
