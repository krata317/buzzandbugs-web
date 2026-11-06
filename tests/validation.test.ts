import { describe, expect, it } from 'vitest';
import {
  passwordStrength,
  validateDisplayName,
  validateEmail,
  validateOtp,
  validatePassword,
  validateSocialUrl,
  validateTitle,
  validateUsername,
} from '@/lib/validation';

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('ada_1')).toBeNull();
    expect(validateUsername('Grace')).toBeNull();
  });

  it('rejects short, invalid and reserved usernames', () => {
    expect(validateUsername('ab')).toMatch(/3–20/);
    expect(validateUsername('has space')).toMatch(/3–20/);
    expect(validateUsername('admin')).toMatch(/not available/);
  });
});

describe('validatePassword', () => {
  it('enforces the backend minimum', () => {
    expect(validatePassword('short')).toMatch(/8 characters/);
    expect(validatePassword('longenough')).toBeNull();
    expect(validatePassword('a'.repeat(129))).toMatch(/128/);
  });
});

describe('validateEmail', () => {
  it('accepts normal addresses', () => {
    expect(validateEmail('ada@example.com')).toBeNull();
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('ada@')).toMatch(/valid/);
    expect(validateEmail('')).toMatch(/Enter/);
  });
});

describe('validateTitle', () => {
  it('requires a title within the limit', () => {
    expect(validateTitle('  ')).toMatch(/Add a title/);
    expect(validateTitle('a'.repeat(201))).toMatch(/200/);
    expect(validateTitle('Fine')).toBeNull();
  });
});

describe('validateOtp', () => {
  it('requires exactly six digits', () => {
    expect(validateOtp('12345')).toMatch(/six-digit/);
    expect(validateOtp('12345a')).toMatch(/six-digit/);
    expect(validateOtp('123456')).toBeNull();
  });
});

describe('validateSocialUrl', () => {
  it('allows empty values and http(s) URLs', () => {
    expect(validateSocialUrl('')).toBeNull();
    expect(validateSocialUrl('https://github.com/ada')).toBeNull();
  });

  it('rejects other protocols and relative values', () => {
    expect(validateSocialUrl('ftp://example.com')).toMatch(/http/);
    expect(validateSocialUrl('github.com/ada')).toMatch(/full URL/);
  });
});

describe('validateDisplayName', () => {
  it('requires a name up to 50 characters', () => {
    expect(validateDisplayName('')).toMatch(/display name/i);
    expect(validateDisplayName('a'.repeat(51))).toMatch(/50/);
    expect(validateDisplayName('Ada')).toBeNull();
  });
});

describe('passwordStrength', () => {
  it('scores longer mixed passwords higher', () => {
    expect(passwordStrength('abc').label).toBe('Too short');
    expect(passwordStrength('Abcdef12').score).toBeGreaterThanOrEqual(3);
  });
});
