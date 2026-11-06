import { MAX_TITLE_LENGTH } from './richText';

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

/** Mirrors the backend's reserved list so the form fails before the request. */
export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'support',
  'deleted',
  'squashedbug',
  'squashed',
  'buzz',
  'bugs',
  'api',
  'system',
  'moderator',
  'staff',
  'official',
  'help',
  'about',
  'settings',
  'login',
  'register',
  'me',
  'users',
  'posts',
  'news',
  'events',
  'trending',
  'notifications',
  'appeals',
  'search',
  'terms',
  'privacy',
]);

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address.';
  if (trimmed.length > 254) return 'That email address is too long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
  return null;
}

export function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Choose a username.';
  if (!USERNAME_PATTERN.test(trimmed)) {
    return 'Use 3–20 characters: letters, numbers and underscores only.';
  }
  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) return 'That username is not available.';
  return null;
}

export function validateDisplayName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter a display name.';
  if (trimmed.length > 50) return 'Display names can be at most 50 characters.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Enter a password.';
  if (value.length < 8) return 'Passwords must be at least 8 characters.';
  if (value.length > 128) return 'Passwords must be at most 128 characters.';
  return null;
}

export function validateTitle(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Add a title.';
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Titles can be at most ${MAX_TITLE_LENGTH} characters.`;
  }
  return null;
}

export function validateOtp(value: string): string | null {
  if (!/^\d{6}$/.test(value.trim())) return 'Enter the six-digit code from your email.';
  return null;
}

export function validateSocialUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 300) return 'Links can be at most 300 characters.';
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Links must start with http:// or https://.';
    }
  } catch {
    return 'Enter a full URL, including https://.';
  }
  return null;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function passwordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: 'Empty' };
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const;
  return { score: Math.min(4, score) as PasswordStrength['score'], label: labels[Math.min(4, score)] };
}
