import { useState } from 'react';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-20 w-20 text-xl',
};

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, name, size = 'md', className, ring }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'bg-raised font-medium uppercase tracking-wide text-muted',
        ring && 'ring-1 ring-line',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={src as string}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
