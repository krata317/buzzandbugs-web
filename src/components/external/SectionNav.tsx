import { Link, useLocation } from 'react-router-dom';
import { sectionLabel } from '@/lib/sections';
import { cn } from '@/lib/cn';

interface SectionNavProps {
  kind: 'news' | 'trending' | 'events';
  basePath: string;
  sections: readonly string[];
}

export function SectionNav({ kind, basePath, sections }: SectionNavProps) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Sections" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar">
      <Link to={basePath} className={cn('chip shrink-0')} data-active={pathname === basePath}>
        All
      </Link>
      {sections.map((section) => (
        <Link
          key={section}
          to={`${basePath}/${section}`}
          className="chip shrink-0"
          data-active={pathname === `${basePath}/${section}`}
        >
          {sectionLabel(kind, section)}
        </Link>
      ))}
    </nav>
  );
}
