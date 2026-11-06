import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import { appealsApi, errorMessage, isApiError } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime } from '@/lib/format';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/form';
import { InlineError, Skeleton } from '@/components/ui/feedback';

export function AppealPage() {
  const { token = '' } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle('Appeal a moderation decision');

  const appeal = useQuery({
    queryKey: ['appeal', token],
    queryFn: ({ signal }) => appealsApi.read(token, signal),
    enabled: token.length >= 20,
    retry: false,
  });

  const submit = useMutation({
    mutationFn: () => appealsApi.submit(token, message.trim()),
  });

  const invalidLink = token.length < 20 || (isApiError(appeal.error) && appeal.error.status === 404);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <Logo />
        <Link
          to="/buzz"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Buzz
        </Link>
      </div>

      <h1 className="mt-10 text-[26px] font-semibold tracking-[-0.02em] text-ink">
        Appeal a moderation decision
      </h1>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
        Appeals are reviewed by a human moderator. Submitting one does not restore the post
        automatically.
      </p>

      <div className="card mt-6 p-5 sm:p-6">
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
                Links expire seven days after a decision, and each link works once. Check the email
                or notification you received.
              </p>
            </div>
          </div>
        ) : null}

        {appeal.isError && !invalidLink ? (
          <InlineError>{errorMessage(appeal.error)}</InlineError>
        ) : null}

        {appeal.data ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-raised/40 px-3.5 py-3">
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
                Case status: <span className="font-mono text-[11.5px] text-ink">{appeal.data.status}</span>
                {appeal.data.providerCategories ? (
                  <>
                    {' '}
                    · automated categories:{' '}
                    <span className="font-mono text-[11.5px] text-ink">
                      {Array.isArray(appeal.data.providerCategories)
                        ? (appeal.data.providerCategories as string[]).join(', ')
                        : String(appeal.data.providerCategories)}
                    </span>
                  </>
                ) : null}
              </p>
            </div>

            {submit.isSuccess ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/[0.06] px-3.5 py-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-medium text-ink">Appeal submitted</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                    A moderator will review the case. You will receive a notification when a
                    decision is made.
                  </p>
                </div>
              </div>
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
              <p className="rounded-lg border border-line bg-raised/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
                {appeal.data.appealUsed
                  ? 'This appeal link has already been used. A moderator is reviewing the case.'
                  : 'The appeal window for this case has closed.'}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
