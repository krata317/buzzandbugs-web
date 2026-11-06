import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { sectionLabel, type SectionKind } from '@/lib/sections';
import { prefersReducedMotion, useActiveSection } from '@/hooks/useActiveSection';

interface SectionJumpNavProps {
  kind: SectionKind;
  basePath: string;
  sections: readonly string[];
}

/**
 * Lists the sections on the page and jumps to them. On a section's own page the entries
 * navigate instead, so the control is never a dead link.
 */
export function SectionJumpNav({ kind, basePath, sections }: SectionJumpNavProps) {
  const { pathname } = useLocation();
  const onBasePage = pathname === basePath;
  const active = useActiveSection(onBasePage ? [...sections] : []);

  const jump = (event: MouseEvent<HTMLAnchorElement>, section: string) => {
    if (!onBasePage) return;

    const element = document.getElementById(`section-${section}`);
    if (!element) {
      return;
    }

    event.preventDefault();
    element.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    window.history.replaceState(null, '', `${basePath}#section-${section}`);
  };

  return (
    <ul className="space-y-0.5">
      {sections.map((section) => {
        const isActive = active === section;
        return (
          <li key={section}>
            <Link
              to={`${basePath}/${section}`}
              onClick={(event) => jump(event, section)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                isActive
                  ? 'bg-accent/[0.07] font-medium text-accent'
                  : 'text-muted hover:bg-raised/60 hover:text-ink',
              )}
            >
              <span
                className={cn(
                  'h-1 w-1 shrink-0 rounded-full transition-colors',
                  isActive ? 'bg-accent' : 'bg-lineStrong',
                )}
                aria-hidden="true"
              />
              <span className="truncate">{sectionLabel(kind, section)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
