import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { useConnection } from '@/hooks/useConnection';
import { Button } from '../ui/Button';

export function ConnectionBanner() {
  const { browserOnline, apiReachable, degraded, checking, recheck } = useConnection();

  if (!browserOnline) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 border-b border-line bg-raised px-4 py-2 text-[12.5px] text-muted"
      >
        <WifiOff size={13} aria-hidden="true" />
        You are offline. Cached content stays readable; actions will fail until you reconnect.
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
          The API is unreachable. Reading is limited to what is already cached.
        </span>
        <button
          type="button"
          onClick={recheck}
          className="focus-ring inline-flex items-center gap-1 rounded underline decoration-current/40 underline-offset-2 hover:decoration-current"
        >
          <RefreshCw size={11} className={checking ? 'animate-spin' : undefined} aria-hidden="true" />
          Retry
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
        The API is up but its database is unhealthy. Some requests will fail.
      </div>
    );
  }

  return null;
}

export function BackendNotice() {
  return (
    <div className="rounded-lg border border-line bg-raised px-4 py-3 text-[12.5px] leading-relaxed text-muted">
      <p className="font-medium text-ink">Can&apos;t reach the API</p>
      <p className="mt-1">
        Start the backend with <code className="font-mono text-[11.5px]">npm run dev</code> in the
        backend folder, then check{' '}
        <Link to="/buzz" className="text-accent underline underline-offset-2">
          Buzz
        </Link>{' '}
        again. The expected base URL is set by{' '}
        <code className="font-mono text-[11.5px]">VITE_API_BASE_URL</code>.
      </p>
    </div>
  );
}

export function RetryButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick} iconLeft={<RefreshCw size={13} />}>
      {loading ? 'Retrying…' : 'Try again'}
    </Button>
  );
}
