import { Plugin, PluginKey } from '@tiptap/pm/state';

/**
 * Domains are matched conservatively: a bare host is only treated as a link when its final
 * label is a known top-level domain. That keeps file names ("node.js"), versions ("2.0.1")
 * and abbreviations ("e.g.") from turning into links.
 */
const KNOWN_TLDS = new Set([
  'com', 'org', 'net', 'io', 'dev', 'ai', 'co', 'app', 'edu', 'gov', 'mil', 'info', 'biz',
  'xyz', 'tech', 'me', 'sh', 'gg', 'tv', 'fm', 'so', 'to', 'uk', 'in', 'us', 'ca', 'de', 'fr',
  'jp', 'au', 'nl', 'se', 'no', 'fi', 'dk', 'es', 'it', 'br', 'ru', 'cn', 'kr', 'sg', 'ie',
  'nz', 'ch', 'at', 'be', 'pl', 'pt', 'cz', 'gr', 'il', 'tr', 'ua', 'hk', 'tw', 'mx', 'ar',
  'cl', 'za', 'eu', 'ly', 'gl', 'page', 'cloud', 'site', 'online', 'store', 'blog', 'design',
  'news', 'media', 'social', 'network', 'systems', 'software', 'tools', 'studio', 'works',
  'email', 'link', 'live', 'life', 'world', 'today', 'digital', 'agency', 'solutions', 'group',
  'team', 'plus', 'run', 'build', 'codes', 'wiki', 'zone', 'space', 'art', 'fun', 'one', 'ink',
  'host', 'press', 'chat', 'video', 'audio', 'photo', 'gallery', 'edu', 'ac', 'gov',
]);

const CANDIDATE =
  /(?:https?:\/\/|www\.)[^\s<>()]+|[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s<>()]*)?/gi;

const TRAILING = /[.,;:!?'"”’]+$/;

export interface DetectedLink {
  start: number;
  end: number;
  href: string;
}

export function normaliseHref(raw: string): string | null {
  const trimmed = raw.replace(TRAILING, '');
  if (!trimmed || trimmed.includes('@')) return null;

  const hasScheme = /^https?:\/\//i.test(trimmed);
  const isWww = /^www\./i.test(trimmed);

  if (!hasScheme && !isWww) {
    const host = trimmed.split('/')[0] ?? '';
    if (!host.includes('.')) return null;
    const tld = host.split('.').pop()?.toLowerCase() ?? '';
    if (!KNOWN_TLDS.has(tld)) return null;
  }

  const withScheme = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Finds URLs in a plain string, including ones without a scheme. */
export function findLinks(text: string): DetectedLink[] {
  const links: DetectedLink[] = [];

  for (const match of text.matchAll(CANDIDATE)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const href = normaliseHref(raw);
    if (!href) continue;

    const visible = raw.replace(TRAILING, '');
    if (visible.length === 0) continue;

    links.push({ start: index, end: index + visible.length, href });
  }

  return links;
}

export const AUTO_LINK_PLUGIN_KEY = new PluginKey('autoLink');

/**
 * Applies link marks to text that looks like a URL, whether it was typed, pasted or
 * inserted programmatically. Runs as an append-transaction so the document stays the single
 * source of truth — the serialised post keeps its links.
 */
export const createAutoLinkPlugin = () =>
  new Plugin({
    key: AUTO_LINK_PLUGIN_KEY,
    appendTransaction: (transactions, _oldState, newState) => {
      if (!transactions.some((transaction) => transaction.docChanged)) return null;

      const linkType = newState.schema.marks.link;
      if (!linkType) return null;

      let tr = newState.tr;
      let changed = false;

      newState.doc.descendants((node, pos) => {
        if (!node.isText || !node.text) return;
        if (node.marks.some((mark) => mark.type === linkType)) return;

        for (const link of findLinks(node.text)) {
          const from = pos + link.start;
          const to = pos + link.end;
          if (from >= to) continue;
          if (newState.doc.rangeHasMark(from, to, linkType)) continue;

          tr = tr.addMark(from, to, linkType.create({ href: link.href }));
          changed = true;
        }
      });

      return changed ? tr : null;
    },
  });
