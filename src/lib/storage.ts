import type { AccentColor, DisplayMode, RichTextDoc } from './api/types';
import { isRichTextDoc } from './richText';

const THEME_KEY = 'bnb.theme.v1';

export interface ThemePreference {
  mode: DisplayMode;
  accent: AccentColor;
}

export const DEFAULT_THEME: ThemePreference = { mode: 'system', accent: 'violet' };

export const ACCENT_COLORS: Array<{ value: AccentColor; label: string }> = [
  { value: 'violet', label: 'Violet' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
  { value: 'rose', label: 'Rose' },
  { value: 'teal', label: 'Teal' },
  { value: 'slate', label: 'Slate' },
];

const isDisplayMode = (value: unknown): value is DisplayMode =>
  value === 'light' || value === 'dark' || value === 'system';

const isAccent = (value: unknown): value is AccentColor =>
  ACCENT_COLORS.some((option) => option.value === value);

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function readThemePreference(): ThemePreference {
  const stored = readJson(THEME_KEY);
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_THEME };
  const candidate = stored as { mode?: unknown; accent?: unknown };
  return {
    mode: isDisplayMode(candidate.mode) ? candidate.mode : DEFAULT_THEME.mode,
    accent: isAccent(candidate.accent) ? candidate.accent : DEFAULT_THEME.accent,
  };
}

export function writeThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_KEY, JSON.stringify(preference));
  } catch {
    /* storage can be unavailable in private mode; the theme still applies for this session */
  }
}

export interface ComposerDraft {
  title: string;
  content: RichTextDoc;
  updatedAt: string;
}

export const draftKeys = {
  newPost: 'bnb.draft.post.v1',
  editPost: (id: string) => `bnb.draft.edit.${id}.v1`,
  reply: (postId: string) => `bnb.draft.reply.${postId}.v1`,
};

export function readDraft(key: string): ComposerDraft | null {
  const stored = readJson(key);
  if (!stored || typeof stored !== 'object') return null;
  const candidate = stored as { title?: unknown; content?: unknown; updatedAt?: unknown };
  if (!isRichTextDoc(candidate.content)) return null;
  return {
    title: typeof candidate.title === 'string' ? candidate.title : '',
    content: candidate.content,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
  };
}

export function writeDraft(key: string, draft: ComposerDraft): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
}

export function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
