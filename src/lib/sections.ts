import type { EventSection, NewsSection, PodcastSection, TrendingSection } from './api/types';

export const NEWS_SECTIONS: NewsSection[] = ['trending', 'ai', 'security', 'leaders', 'india'];
export const EVENT_SECTIONS: EventSection[] = ['hackathons', 'contests', 'ctf'];
export const TRENDING_SECTIONS: TrendingSection[] = [
  'youtube',
  'repositories',
  'models',
  'datasets',
  'papers',
];
export const PODCAST_SECTIONS: PodcastSection[] = [
  'changelog',
  'freecodecamp',
  'sedaily',
  'infoq',
  'syntax',
];

export const NEWS_LABELS: Record<NewsSection, string> = {
  trending: 'Trending',
  ai: 'AI, ML & Research',
  security: 'Cybersecurity',
  leaders: 'Tech Leaders',
  india: 'Indian Tech',
};

export const NEWS_DESCRIPTIONS: Record<NewsSection, string> = {
  trending: 'What the wider technology press is covering right now.',
  ai: 'Model releases, research notes and machine-learning coverage.',
  security: 'Vulnerabilities, breaches and defensive research.',
  leaders: 'Platform and company announcements from engineering teams.',
  india: 'The Indian technology and startup press.',
};

export const EVENT_LABELS: Record<EventSection, string> = {
  hackathons: 'Hackathons',
  contests: 'Coding contests',
  ctf: 'Capture the Flag',
};

export const EVENT_DESCRIPTIONS: Record<EventSection, string> = {
  hackathons: 'Build weekends, online jams and open innovation challenges.',
  contests: 'Rated rounds on LeetCode, CodeChef and Codeforces.',
  ctf: 'Security competitions listed on CTFtime.',
};

export const TRENDING_LABELS: Record<TrendingSection, string> = {
  youtube: 'YouTube',
  repositories: 'Repositories',
  models: 'Models',
  datasets: 'Datasets',
  papers: 'Research papers',
};

export const TRENDING_DESCRIPTIONS: Record<TrendingSection, string> = {
  youtube: 'Popular developer videos this week.',
  repositories: 'The most-starred open-source projects on GitHub.',
  models: 'Trending models on Hugging Face.',
  datasets: 'The most-downloaded datasets on Hugging Face.',
  papers: 'Trending papers tracked by Papers with Code.',
};

export const PODCAST_LABELS: Record<PodcastSection, string> = {
  changelog: 'The Changelog',
  freecodecamp: 'freeCodeCamp',
  sedaily: 'Software Engineering Daily',
  infoq: 'InfoQ',
  syntax: 'Syntax',
};

export const PODCAST_DESCRIPTIONS: Record<PodcastSection, string> = {
  changelog: 'Conversations with the people building and maintaining open source.',
  freecodecamp: 'Practical lessons for people learning to build software.',
  sedaily: 'Interviews about the engineering behind production systems.',
  infoq: 'Architecture, delivery and engineering practice from InfoQ.',
  syntax: 'Two developers working through the details of web development.',
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  github: 'GitHub',
  huggingface: 'Hugging Face',
  paperswithcode: 'Papers with Code',
  podcast: 'Podcast',
  leetcode: 'LeetCode',
  codechef: 'CodeChef',
  codeforces: 'Codeforces',
  ctftime: 'CTFtime',
  unstop: 'Unstop',
  devpost: 'Devpost',
  devfolio: 'Devfolio',
  hackerearth: 'HackerEarth',
  mlh: 'MLH',
  generic: 'External',
};

export function platformLabel(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  return PLATFORM_LABELS[value] ?? value;
}

export type SectionKind = 'news' | 'trending' | 'events' | 'podcasts';

export function sectionLabel(kind: SectionKind, section: string): string {
  if (kind === 'news') return NEWS_LABELS[section as NewsSection] ?? section;
  if (kind === 'trending') return TRENDING_LABELS[section as TrendingSection] ?? section;
  if (kind === 'podcasts') return PODCAST_LABELS[section as PodcastSection] ?? section;
  return EVENT_LABELS[section as EventSection] ?? section;
}

export function sectionDescription(kind: SectionKind, section: string): string | null {
  if (kind === 'news') return NEWS_DESCRIPTIONS[section as NewsSection] ?? null;
  if (kind === 'trending') return TRENDING_DESCRIPTIONS[section as TrendingSection] ?? null;
  if (kind === 'podcasts') return PODCAST_DESCRIPTIONS[section as PodcastSection] ?? null;
  return EVENT_DESCRIPTIONS[section as EventSection] ?? null;
}

export function isNewsSection(value: string): value is NewsSection {
  return (NEWS_SECTIONS as string[]).includes(value);
}

export function isTrendingSection(value: string): value is TrendingSection {
  return (TRENDING_SECTIONS as string[]).includes(value);
}

export function isEventSection(value: string): value is EventSection {
  return (EVENT_SECTIONS as string[]).includes(value);
}

export function isPodcastSection(value: string): value is PodcastSection {
  return (PODCAST_SECTIONS as string[]).includes(value);
}

/** Human-readable metadata values coming from the external sources. */
export function numberMeta(metadata: Record<string, unknown> | null, key: string): number | null {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function stringMeta(metadata: Record<string, unknown> | null, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function stringListMeta(
  metadata: Record<string, unknown> | null,
  key: string,
): string[] {
  const value = metadata?.[key];
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}
