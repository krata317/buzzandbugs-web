import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Buzz and Bugs home"
      className={cn('focus-ring inline-flex items-center gap-2.5 rounded-md', className)}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-accent text-accentInk">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="16.6" r="1.9" fill="currentColor" />
          <path
            d="M8.1 11.6a5.6 5.6 0 0 1 7.8 0"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M5.3 8.7a9.6 9.6 0 0 1 13.4 0"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </span>
      {showWordmark ? (
        <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
          Buzz<span className="font-normal text-subtle"> & </span>Bugs
        </span>
      ) : null}
    </Link>
  );
}
