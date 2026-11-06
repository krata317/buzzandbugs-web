import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      to="/"
      aria-label="Buzz and Bugs home"
      className={cn('focus-ring inline-flex items-center gap-2.5 rounded-md', className)}
    >
      <img
        src="/brand/logo.png"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-[7px] object-cover ring-1 ring-inset ring-black/10"
      />
      {showWordmark ? (
        <span className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
          Buzz<span className="font-normal text-subtle"> & </span>Bugs
        </span>
      ) : null}
    </Link>
  );
}
