import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ExternalLink, X } from 'lucide-react';
import type { AdminCase } from '@/lib/api/types';
import { useAdminCases, useDecideCase } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { AdminHeader } from './adminUi';
import { Badge, EmptyState, ErrorState, LoadingBlock } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/form';
import { Modal } from '@/components/ui/overlay';
import { SegmentedControl } from '@/components/ui/nav';
import { useToast } from '@/providers/ToastProvider';

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'APPEALED', label: 'Awaiting decision' },
  { value: 'RESOLVED_KEPT', label: 'Restored' },
  { value: 'RESOLVED_REMOVED', label: 'Upheld' },
];

/** Only appealed cases ever reach this screen. */
const STATUS_TONE: Record<string, 'neutral' | 'accent' | 'success' | 'warning' | 'danger'> = {
  APPEALED: 'accent',
  RESOLVED_KEPT: 'success',
  RESOLVED_REMOVED: 'danger',
};

export function AdminModerationPage() {
  const [status, setStatus] = useState('APPEALED');
  const [active, setActive] = useState<AdminCase | null>(null);
  const [decision, setDecision] = useState<'accept' | 'reject'>('accept');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const cases = useAdminCases(status);
  const decide = useDecideCase();
  const toast = useToast();

  const openCase = (entry: AdminCase, nextDecision: 'accept' | 'reject') => {
    setActive(entry);
    setDecision(nextDecision);
    setNote('');
    setError(null);
  };

  return (
    <div>
      <AdminHeader
        title="Moderation"
        description="Only posts whose author appealed an automated decision appear here. Accepting restores the post; rejecting removes it and issues a warning."
      />

      <div className="mb-4">
        <SegmentedControl
          label="Case status"
          value={status}
          onChange={setStatus}
          options={STATUS_FILTERS}
        />
      </div>

      {cases.isLoading ? <LoadingBlock label="Loading cases" /> : null}

      {cases.isError ? (
        <ErrorState
          title="Cases could not load"
          description={errorMessage(cases.error)}
          onRetry={() => void cases.refetch()}
        />
      ) : null}

      {cases.data && cases.data.length === 0 ? (
        <EmptyState
          title="No cases in this state"
          description="Change the filter, or wait for a report to create a case."
        />
      ) : null}

      {cases.data && cases.data.length > 0 ? (
        <ul className="space-y-2.5">
          {cases.data.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[entry.status] ?? 'neutral'}>{entry.status.replace(/_/g, ' ')}</Badge>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                  {entry.reportCount} report{entry.reportCount === 1 ? '' : 's'} ·{' '}
                  {formatDateTime(entry.createdAt)}
                </span>
                {entry.appealExpiresAt ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                    · deadline {formatDateTime(entry.appealExpiresAt)}
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-[13.5px] font-medium text-ink">
                {entry.post?.title ?? entry.postTitle ?? 'Removed post'}
              </p>
              {entry.post ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                  {entry.post.excerpt}
                </p>
              ) : (
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  The post was removed permanently. This record is kept for the retention window.
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                <span>
                  Author:{' '}
                  {entry.post?.author ? (
                    <Link
                      to={`/admin/users/${entry.post.author.id}`}
                      className="text-muted underline underline-offset-2 hover:text-accent"
                    >
                      @{entry.post.author.username}
                    </Link>
                  ) : (
                    'deleted'
                  )}
                </span>
                <span>Visibility: {entry.post?.visibility ?? 'removed'}</span>
                {entry.post ? (
                  <Link
                    to={`/posts/${entry.post.id}`}
                    className="inline-flex items-center gap-1 text-muted underline underline-offset-2 hover:text-accent"
                  >
                    Open post <ExternalLink size={9} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>

              {entry.appealMessage ? (
                <blockquote className="mt-3 rounded-md border-l-2 border-accent/40 bg-raised/50 px-3 py-2 text-[12.5px] leading-relaxed text-ink">
                  {entry.appealMessage}
                </blockquote>
              ) : null}

              {entry.status === 'APPEALED' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    iconLeft={<Check size={13} />}
                    onClick={() => openCase(entry, 'accept')}
                  >
                    Accept appeal
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    iconLeft={<X size={13} />}
                    onClick={() => openCase(entry, 'reject')}
                  >
                    Reject appeal
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={decision === 'accept' ? 'Accept this appeal?' : 'Reject this appeal?'}
        description={
          decision === 'accept'
            ? 'The post becomes visible again. No warning is issued.'
            : 'The post is removed and a warning is added to the author’s account.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button
              variant={decision === 'accept' ? 'primary' : 'danger'}
              loading={decide.isPending}
              onClick={() => {
                if (!active) return;
                decide.mutate(
                  { id: active.id, decision, note: note.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.push({
                        title: decision === 'accept' ? 'Appeal accepted' : 'Appeal rejected',
                        tone: 'success',
                      });
                      setActive(null);
                    },
                    onError: (mutationError) => setError(errorMessage(mutationError)),
                  },
                );
              }}
            >
              {decision === 'accept' ? 'Accept' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-muted">
            {active?.post?.title ?? active?.postTitle ?? 'Removed post'}
          </p>
          <Field
            label="Decision note"
            htmlFor="decision-note"
            optional
            hint="Stored on the case and written to the audit log."
          >
            <Textarea
              id="decision-note"
              value={note}
              rows={3}
              maxLength={2000}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        </div>
      </Modal>
    </div>
  );
}
