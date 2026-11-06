import { describe, expect, it } from 'vitest';
import {
  docFromText,
  docLength,
  emptyDoc,
  plainText,
  prepareDoc,
  MAX_CONTENT_LENGTH,
} from '@/lib/richText';

describe('docFromText', () => {
  it('splits blank lines into paragraphs', () => {
    const doc = docFromText('first block\n\nsecond block');
    expect(doc.content).toHaveLength(2);
    expect(plainText(doc)).toBe('first block\nsecond block');
  });

  it('returns an empty document for blank input', () => {
    expect(docFromText('   ')).toEqual(emptyDoc());
  });
});

describe('prepareDoc', () => {
  it('rejects an empty document', () => {
    const result = prepareDoc(emptyDoc());
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/write something/i);
  });

  it('drops trailing empty paragraphs', () => {
    const result = prepareDoc({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
        { type: 'paragraph' },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.doc?.content).toHaveLength(1);
  });

  it('removes unsupported nodes and marks', () => {
    const result = prepareDoc({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'kept',
              marks: [
                { type: 'bold' },
                { type: 'strike' },
                { type: 'fontSize', attrs: { size: '14px' } },
              ],
            },
          ],
        },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'gone' }] },
        { type: 'codeBlock', content: [{ type: 'text', text: 'gone' }] },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.doc?.content).toHaveLength(1);
    const marks = result.doc?.content?.[0]?.content?.[0]?.marks ?? [];
    expect(marks.map((mark) => mark.type)).toEqual(['bold', 'fontSize']);
  });

  it('drops unsafe link marks but keeps the text', () => {
    const result = prepareDoc({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'click',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.doc?.content?.[0]?.content?.[0]?.marks).toBeUndefined();
  });

  it('keeps http links with only the href attribute', () => {
    const result = prepareDoc({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'click',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/a', target: '_blank', rel: 'nofollow' },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result.doc?.content?.[0]?.content?.[0]?.marks).toEqual([
      { type: 'link', attrs: { href: 'https://example.com/a' } },
    ]);
  });

  it('normalises bullet lists and rejects empty ones', () => {
    const result = prepareDoc({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item' }] }],
            },
          ],
        },
        { type: 'bulletList', content: [] },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.doc?.content).toHaveLength(1);
    expect(result.doc?.content?.[0]?.type).toBe('bulletList');
  });

  it('enforces the character limit', () => {
    const result = prepareDoc({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'a'.repeat(MAX_CONTENT_LENGTH + 1) }] },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/limit/i);
  });

  it('counts characters across paragraphs', () => {
    // "abc" + newline separator + "defg"
    expect(docLength(docFromText('abc\n\ndefg'))).toBe(8);
  });
});
