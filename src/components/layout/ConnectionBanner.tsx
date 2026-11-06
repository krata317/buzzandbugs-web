import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { useConnection } from '@/hooks/useConnection';

export function ConnectionBanner() {
  const { browserOnline, apiReachable, degraded, checking, recheck } = useConnection();

  if (!browserOnline) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 border-b border-line bg-raised px-4 py-2 text-[12.5px] text-muted"
      >
        <WifiOff size={13} aria-hidden="true" />
        You are offline. You can keep reading, but new activity will not load until you reconnect.
      </div>
    );
  }

  if (apiReachable === false) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-danger/20 bg-danger/5 px-4 py-2 text-[12.5px] text-danger"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle size={13} aria-hidden="true" />
          We can&apos;t reach Buzz and Bugs right now. Some content may be out of date.
        </span>
        <button
          type="button"
          onClick={recheck}
          className="focus-ring inline-flex items-center gap-1 rounded underline decoration-current/40 underline-offset-2 hover:decoration-current"
        >
          <RefreshCw size={11} className={checking ? 'animate-spin' : undefined} aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  if (degraded) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[12.5px] text-amber-700 dark:text-amber-300"
      >
        <AlertTriangle size={13} aria-hidden="true" />
        Some parts of Buzz and Bugs are temporarily unavailable. Reading still works.
      </div>
    );
  }

  return null;
}
