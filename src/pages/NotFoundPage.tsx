import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { buttonStyles } from '@/components/ui/Button';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-subtle">
        <Compass size={22} aria-hidden="true" />
      </span>
      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">404</p>
      <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-ink">
        This page does not exist
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
        The link may be outdated, or the content was removed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/buzz" className={buttonStyles({ variant: 'primary', size: 'md' })}>
          Go to Buzz
        </Link>
        <Link to="/" className={buttonStyles({ variant: 'secondary', size: 'md' })}>
          Home
        </Link>
      </div>
    </div>
  );
}
