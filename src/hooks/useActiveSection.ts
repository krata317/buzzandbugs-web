import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view. The top offset accounts for the sticky header
 * so the highlighted item matches what the reader is actually looking at.
 */
export function useActiveSection(slugs: string[]): string | null {
  const key = slugs.join('|');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const list = key.split('|').filter(Boolean);
    if (list.length === 0) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let attempts = 0;

    // Sections render after their data arrives, so keep trying briefly instead of
    // giving up on the first (empty) paint.
    const connect = () => {
      if (cancelled) return;

      const elements = list
        .map((slug) => document.getElementById(`section-${slug}`))
        .filter((element): element is HTMLElement => Boolean(element));

      if (elements.length === 0) {
        if (attempts < 12) {
          attempts += 1;
          window.setTimeout(connect, 250);
        }
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          const first = visible[0];
          if (first) setActive(first.target.id.replace('section-', ''));
        },
        { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
      );

      for (const element of elements) observer.observe(element);
    };

    connect();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [key]);

  return active;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
