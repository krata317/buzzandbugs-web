import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds. Ignored when the visitor prefers reduced motion. */
  delay?: number;
}

/**
 * Reveals its children once they scroll into view. The animation itself lives in CSS, so the
 * component only has to flip a data attribute; visitors who prefer reduced motion skip the
 * observer entirely and see the content immediately.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      data-visible={visible ? 'true' : 'false'}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
      className={cn('reveal', className)}
    >
      {children}
    </div>
  );
}
