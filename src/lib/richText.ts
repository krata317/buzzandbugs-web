import type { RichTextDoc, RichTextMark, RichTextNode } from './api/types';

export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 20_000;
export const EXCERPT_LENGTH = 280;

const MARK_TYPES = new Set(['bold', 'italic', 'underline', 'link', 'fontSize']);

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function emptyDoc(): RichTextDoc {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

/** Turns plain text into the paragraph-per-blank-line document the API accepts. */
export function docFromText(text: string): RichTextDoc {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return emptyDoc();

  return {
    type: 'doc',
    content: blocks.map((block) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: block }],
    })),
  };
}

export function plainText(node: RichTextNode | RichTextDoc | null | undefined): string {
  if (!node) return '';
  const parts: string[] = [];

  const visit = (current: RichTextNode): void => {
    if (typeof current.text === 'string') parts.push(current.text);
    if (current.type === 'hardBreak') parts.push('\n');
    if (current.type === 'mention') parts.push('@');
    if (current.type === 'paragraph') parts.push('\n');
    current.content?.forEach(visit);
  };

  visit(node as RichTextNode);

  return parts
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function docLength(doc: RichTextDoc | null | undefined): number {
  return plainText(doc).length;
}

const normalizeMarks = (marks: RichTextMark[] | undefined): RichTextMark[] => {
  if (!marks || marks.length === 0) return [];
  const seen = new Set<string>();
  const output: RichTextMark[] = [];

  for (const mark of marks) {
    if (!mark || typeof mark.type !== 'string' || !MARK_TYPES.has(mark.type)) continue;
    if (seen.has(mark.type)) continue;

    if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
      if (!isHttpUrl(href)) continue;
      output.push({ type: 'link', attrs: { href } });
    } else if (mark.type === 'fontSize') {
      const size = mark.attrs?.size;
      if (typeof size === 'string' && /^(1\d|2\d|3[0-2])px$/.test(size)) {
        output.push({ type: 'fontSize', attrs: { size } });
      }
    } else {
      output.push({ type: mark.type });
    }

    seen.add(mark.type);
  }

  return output;
};

const normalizeInline = (node: RichTextNode): RichTextNode | null => {
  if (!node || typeof node !== 'object') return null;

  if (node.type === 'text') {
    if (typeof node.text !== 'string' || node.text.length === 0) return null;
    const marks = normalizeMarks(node.marks);
    return marks.length > 0
      ? { type: 'text', text: node.text, marks }
      : { type: 'text', text: node.text };
  }

  if (node.type === 'hardBreak') return { type: 'hardBreak' };

  if (node.type === 'mention') {
    const id = node.attrs?.id;
    if (typeof id !== 'string' || id.length === 0) return null;
    return { type: 'mention', attrs: { id } };
  }

  return null;
};

const normalizeParagraph = (node: RichTextNode): RichTextNode => {
  const children = Array.isArray(node.content)
    ? node.content.map(normalizeInline).filter((child): child is RichTextNode => child !== null)
    : [];

  return children.length > 0 ? { type: 'paragraph', content: children } : { type: 'paragraph' };
};

const normalizeList = (node: RichTextNode): RichTextNode | null => {
  if (!Array.isArray(node.content) || node.content.length === 0) return null;

  const items = node.content.map((item) => {
    const paragraphs = Array.isArray(item?.content)
      ? item.content
          .filter((child) => child?.type === 'paragraph')
          .map((child) => normalizeParagraph(child))
      : [];

    return {
      type: 'listItem',
      content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph' }],
    };
  });

  return { type: 'bulletList', content: items };
};

export interface DocValidation {
  ok: boolean;
  error?: string;
  doc?: RichTextDoc;
}

/**
 * Mirrors the backend's rich-text validator so invalid documents are caught before
 * they are sent. Unsupported nodes and marks are dropped rather than submitted.
 */
export function prepareDoc(input: RichTextDoc | null | undefined): DocValidation {
  if (!input || typeof input !== 'object' || input.type !== 'doc') {
    return { ok: false, error: 'Content must be a document.' };
  }

  const blocks: RichTextNode[] = [];

  for (const node of input.content ?? []) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'paragraph') {
      blocks.push(normalizeParagraph(node));
    } else if (node.type === 'bulletList') {
      const list = normalizeList(node);
      if (list) blocks.push(list);
    }
  }

  while (blocks.length > 0) {
    const last = blocks[blocks.length - 1];
    if (last.type === 'paragraph' && !last.content?.length) blocks.pop();
    else break;
  }

  if (blocks.length === 0) {
    return { ok: false, error: 'Write something before publishing.' };
  }

  const doc: RichTextDoc = { type: 'doc', content: blocks };
  const length = docLength(doc);

  if (length === 0) {
    return { ok: false, error: 'Write something before publishing.' };
  }

  if (length > MAX_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `Content is ${length.toLocaleString()} characters. The limit is ${MAX_CONTENT_LENGTH.toLocaleString()}.`,
    };
  }

  return { ok: true, doc };
}

/** Ensures a stored draft is still structurally usable. */
export function isRichTextDoc(value: unknown): value is RichTextDoc {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: unknown }).type === 'doc' &&
    Array.isArray((value as { content?: unknown }).content)
  );
}
