import { describe, expect, it } from 'vitest';
import { findLinks, normaliseHref } from '@/lib/autoLink';

describe('normaliseHref', () => {
  it('keeps explicit http and https links', () => {
    expect(normaliseHref('https://example.com')).toBe('https://example.com/');
    expect(normaliseHref('http://example.com/a?b=1')).toBe('http://example.com/a?b=1');
  });

  it('adds a scheme to bare hosts and www links', () => {
    expect(normaliseHref('example.com')).toBe('https://example.com/');
    expect(normaliseHref('www.example.com/path')).toBe('https://www.example.com/path');
  });

  it('rejects unsafe schemes', () => {
    expect(normaliseHref('javascript:alert(1)')).toBeNull();
    expect(normaliseHref('data:text/html,hello')).toBeNull();
  });

  it('rejects file names and version strings', () => {
    expect(normaliseHref('node.js')).toBeNull();
    expect(normaliseHref('main.ts')).toBeNull();
    expect(normaliseHref('2.0.1')).toBeNull();
  });

  it('rejects email addresses', () => {
    expect(normaliseHref('ada@example.com')).toBeNull();
  });
});

describe('findLinks', () => {
  it('finds several links in one string', () => {
    const links = findLinks('See https://example.com and www.foo.dev, plus bar.io/x.');
    expect(links.map((link) => link.href)).toEqual([
      'https://example.com/',
      'https://www.foo.dev/',
      'https://bar.io/x',
    ]);
  });

  it('reports offsets that cover only the link text', () => {
    const text = 'read example.com now';
    const [link] = findLinks(text);
    expect(link).toBeDefined();
    expect(text.slice(link.start, link.end)).toBe('example.com');
  });

  it('leaves ordinary prose alone', () => {
    expect(findLinks('Use v2.0.1 or read the node.js docs.')).toHaveLength(0);
    expect(findLinks('e.g. this sentence has no links')).toHaveLength(0);
  });

  it('trims trailing punctuation from the link', () => {
    const links = findLinks('Visit example.com, then leave.');
    expect(links).toHaveLength(1);
    expect(links[0]?.href).toBe('https://example.com/');
  });
});
