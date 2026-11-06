import { useEffect } from 'react';

const SUFFIX = 'Buzz and Bugs';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
  }, [title]);
}
