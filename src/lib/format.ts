const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** Compact, human relative time. Falls back to an absolute date after a week. */
export function relativeTime(value: string, now: number = Date.now()): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';
  const diff = timestamp - now;
  const abs = Math.abs(diff);

  if (abs < MINUTE) return 'just now';
  if (abs < HOUR) return relative.format(Math.round(diff / MINUTE), 'minute');
  if (abs < DAY) return relative.format(Math.round(diff / HOUR), 'hour');
  if (abs < 7 * DAY) return relative.format(Math.round(diff / DAY), 'day');
  return formatDate(value);
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function formatDayNumber(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '–';
  return new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
}

export function formatMonth(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { month: 'short' }).format(date).toUpperCase();
}

export function formatWeekday(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat('en');

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return Math.abs(value) < 1000 ? plain.format(value) : compact.format(value);
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${Math.max(1, minutes)}m`;
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Date to be announced';
  if (start && !end) return formatDateTime(start);
  if (!start && end) return `Ends ${formatDateTime(end)}`;
  const startDate = new Date(start as string);
  const endDate = new Date(end as string);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Date to be announced';
  }
  const sameDay = startDate.toDateString() === endDate.toDateString();
  return sameDay
    ? `${formatDateTime(start as string)} – ${formatTime(end as string)}`
    : `${formatDateTime(start as string)} → ${formatDateTime(end as string)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Feed summaries occasionally arrive with markup that survived entity decoding upstream
 * (Google News is the usual offender). Decode, drop tag-like sequences and collapse space
 * so the text reads as prose instead of source.
 */
export function cleanText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
