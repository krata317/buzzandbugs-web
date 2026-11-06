import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarClock, LogOut, ShieldCheck } from 'lucide-react';
import { authApi, errorMessage } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/feedback';
import { Logo } from '@/components/Logo';
import { formatDateTime } from '@/lib/format';

/**
 * Shown instead of the application whenever the signed-in account has a deletion scheduled.
 * The session is valid — the account is simply closed to content until the request is
 * cancelled, which removes it entirely and restores access immediately.
 */
export function AccountHoldPage({ scheduledFor }: { scheduledFor: string }) {
  useDocumentTitle('Account scheduled for deletion');
  const { signOut, refresh } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await authApi.cancelAccountDeletion();
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await refresh();
      navigate('/buzz', { replace: true });
    } catch (cancelError) {
      setError(errorMessage(cancelError));
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    navigate('/', { replace: true });
    await signOut();
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="dot-grid absolute inset-0 opacity-60" />
        <span className="aura -left-24 -top-32 h-[380px] w-[380px] bg-danger/15" />
        <span
          className="aura right-[-10%] top-1/3 h-[320px] w-[320px] bg-accent/20"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo />
        <button
          type="button"
          onClick={() => void leave()}
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 pb-20 sm:px-6">
        <div className="panel panel-accent p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-danger">
            <CalendarClock size={12} aria-hidden="true" />
            Deletion scheduled
          </span>

          <h1 className="mt-5 font-serif text-[34px] leading-[1.05] tracking-[-0.025em] text-ink sm:text-[40px]">
            Your account is closing.
          </h1>

          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            You are signed in, but the platform is closed to this account because you asked us to
            delete it. It is scheduled to be deleted on{' '}
            <strong className="font-medium text-ink">{formatDateTime(scheduledFor)}</strong>.
          </p>

          <div className="mt-6 rounded-xl border border-line bg-raised/50 p-4">
            <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              Cancelling removes the request completely and restores access immediately. Your
              posts, replies and profile are untouched.
            </p>
          </div>

          {error ? (
            <div className="mt-4">
              <InlineError>{error}</InlineError>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button variant="primary" size="lg" loading={busy} onClick={() => void cancel()}>
              Cancel deletion and continue
            </Button>
            <Button variant="secondary" size="lg" onClick={() => void leave()}>
              Sign out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
