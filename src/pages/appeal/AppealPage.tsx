import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { appealsApi, authApi, errorMessage, isApiError } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from '@/providers/AuthProvider';
import { formatDateTime } from '@/lib/format';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/form';
import { InlineError, Skeleton } from '@/components/ui/feedback';

export function AppealPage() {
  const { token = '' } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useDocumentTitle('Appeal a moderation decision');

  const appeal = useQuery({
    queryKey: ['appeal', token],
    queryFn: ({ signal }) => appealsApi.read(token, signal),
    enabled: token.length >= 20,
    retry: false,
  });

  const submit = useMutation({
    mutationFn: () => appealsApi.submit(token, message.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appeal', token] });
    },
  });

  const cancelDeletion = useMutation({
    mutationFn: () => authApi.cancelAccountDeletion(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['appeal', token] }),
      ]);
    },
    onError: (cancelError) => setError(errorMessage(cancelError)),
  });

  const invalidLink = token.length < 20 || (isApiError(appeal.error) && appeal.error.status === 404);
  const viewer = appeal.data?.viewer;

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="dot-grid absolute inset-0 opacity-60" />
        <span className="aura -left-32 -top-40 h-[420px] w-[420px] bg-accent/20" />
      </div>

      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to={isAuthenticated ? '/buzz' : '/'}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            {isAuthenticated ? 'Buzz' : 'Home'}
          </Link>
        </div>

        <p className="meta mt-12">Moderation</p>
        <h1 className="mt-2 font-serif text-[34px] leading-[1.05] tracking-[-0.025em] text-ink sm:text-[40px]">
          Appeal a decision
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
          Appeals are read by a person. Submitting one does not restore the post automatically.
        </p>

        <div className="panel mt-7 p-5 sm:p-6">
          {appeal.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : null}

          {invalidLink ? (
            <div className="flex items-start gap-3">
              <XCircle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
              <div>
                <p className="text-[14px] font-medium text-ink">This appeal link is not valid</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  Links expire seven days after a decision, and each link works once. Check the
                  email or notification you received.
                </p>
              </div>
            </div>
          ) : null}

          {appeal.isError && !invalidLink ? (
            <InlineError>{errorMessage(appeal.error)}</InlineError>
          ) : null}

          {appeal.data ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-raised/50 px-3.5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
                  Post under review
                </p>
                <p className="mt-1 text-[13.5px] font-medium text-ink">{appeal.data.postTitle}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-subtle">
                  <Clock size={10} aria-hidden="true" />
                  Hidden {formatDateTime(appeal.data.postHiddenAt)}
                  {appeal.data.appealDeadline
                    ? ` · deadline ${formatDateTime(appeal.data.appealDeadline)}`
                    : ''}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldAlert size={15} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Case status:{' '}
                  <span className="font-mono text-[11.5px] text-ink">{appeal.data.status}</span>
                </p>
              </div>

              {submit.isSuccess ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent/[0.06] px-3.5 py-3">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[13px] font-medium text-ink">Appeal submitted</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                      A moderator will review the case. You will receive a notification when a
                      decision is made.
                    </p>
                  </div>
                </div>
              ) : viewer?.pendingDeletion ? (
                <div className="rounded-xl border border-danger/25 bg-danger/[0.05] px-3.5 py-3.5">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                    <ShieldCheck size={15} className="text-danger" aria-hidden="true" />
                    Your account is scheduled for deletion
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                    You can appeal once the deletion is cancelled. Cancelling removes the request
                    and restores access immediately.
                  </p>
                  {error ? (
                    <div className="mt-3">
                      <InlineError>{error}</InlineError>
                    </div>
                  ) : null}
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    loading={cancelDeletion.isPending}
                    onClick={() => cancelDeletion.mutate()}
                  >
                    Cancel deletion
                  </Button>
                </div>
              ) : !viewer?.signedIn ? (
                <div className="rounded-xl border border-line bg-raised/40 px-3.5 py-3.5">
                  <p className="text-[13px] font-medium text-ink">Sign in to appeal</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                    For safety, appeals can only be submitted from the author&apos;s account.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: `/appeals/${token}` }}
                    className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-md text-[12.5px] font-medium text-accent transition-colors hover:text-ink"
                  >
                    <LogIn size={13} aria-hidden="true" />
                    Sign in
                  </Link>
                </div>
              ) : !viewer.isAuthor ? (
                <p className="rounded-xl border border-line bg-raised/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
                  This appeal belongs to another account. Sign in as the author of the post to
                  submit it.
                </p>
              ) : appeal.data.canAppeal ? (
                <div className="space-y-3">
                  <Field
                    label="Why should this post be restored?"
                    htmlFor="appeal-message"
                    hint={`${message.length}/4000 · at least 10 characters`}
                  >
                    <Textarea
                      id="appeal-message"
                      value={message}
                      rows={6}
                      maxLength={4000}
                      placeholder="Explain the context. Be specific — moderators only see this text and the post."
                      onChange={(event) => {
                        setMessage(event.target.value);
                        setError(null);
                      }}
                    />
                  </Field>

                  {error ? <InlineError>{error}</InlineError> : null}

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={submit.isPending}
                      disabled={message.trim().length < 10}
                      onClick={() =>
                        submit.mutate(undefined, {
                          onError: (mutationError) => setError(errorMessage(mutationError)),
                        })
                      }
                    >
                      Submit appeal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-line bg-raised/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
                  {appeal.data.appealUsed
                    ? 'This appeal link has already been used. A moderator is reviewing the case.'
                    : 'The appeal window for this case has closed.'}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
