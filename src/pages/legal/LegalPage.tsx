import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/nav';

export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        to="/"
        className="focus-ring mb-6 inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Back to Buzz and Bugs
      </Link>

      <PageHeader serif title={title} description={intro} />

      <p className="mb-8 font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">
        Last updated {updated}
      </p>

      <div className="space-y-8 text-[13.5px] leading-[1.75] text-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-ink [&_li]:mt-1.5 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>

      <p className="mt-12 border-t border-line pt-5 text-[11.5px] leading-relaxed text-subtle">
        This document uses placeholder contact details and jurisdiction. The operator must replace
        them, and have the text reviewed locally, before relying on it.
      </p>
    </div>
  );
}
