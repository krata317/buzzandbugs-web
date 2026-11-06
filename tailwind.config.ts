import type { Config } from 'tailwindcss';

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: withAlpha('--canvas'),
        surface: withAlpha('--surface'),
        raised: withAlpha('--raised'),
        line: withAlpha('--line'),
        lineStrong: withAlpha('--line-strong'),
        ink: withAlpha('--ink'),
        muted: withAlpha('--muted'),
        subtle: withAlpha('--subtle'),
        accent: withAlpha('--accent'),
        accentInk: withAlpha('--accent-ink'),
        accent2: withAlpha('--accent-2'),
        accent2Ink: withAlpha('--accent-2-ink'),
        up: withAlpha('--up'),
        down: withAlpha('--down'),
        danger: withAlpha('--danger'),
        dangerInk: withAlpha('--danger-ink'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.625rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px -16px rgb(var(--shadow) / 0.28)',
        lift: '0 2px 4px rgb(var(--shadow) / 0.08), 0 18px 40px -24px rgb(var(--shadow) / 0.4)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -4%, 0) scale(1.08)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'rise-in': 'rise-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 160ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slide-up 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.4s infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'float-slow': 'float-slow 20s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
