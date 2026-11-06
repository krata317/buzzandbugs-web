import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAdminAudit, useClearAuditLogs } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { AdminHeader } from './adminUi';
import { Badge, EmptyState, ErrorState, LoadingBlock } from '@/components/ui/feedback';
import { Input } from '@/components/ui/form';
import { LoadMore } from '@/components/ui/nav';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/providers/ToastProvider';

export function AdminAuditPage() {
  const [action, setAction] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const debounced = useDebouncedValue(action.trim(), 400);
  const logs = useAdminAudit(debounced);
  const clear = useClearAuditLogs();
  const toast = useToast();

  const items = logs.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      <AdminHeader
        title="Audit log"
        description="Every admin and system action that changes state, newest first."
        actions={
          <Button
            variant="danger"
            size="sm"
            iconLeft={<Trash2 size={13} />}
            onClick={() => setConfirmOpen(true)}
          >
            Clear log
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Filter by action, e.g. moderation.appeal_accepted"
          aria-label="Filter audit log by action"
          className="font-mono text-[12px]"
        />
      </div>

      {logs.isLoading ? <LoadingBlock label="Loading audit entries" /> : null}

      {logs.isError ? (
        <ErrorState
          title="Audit log could not load"
          description={errorMessage(logs.error)}
          onRetry={() => void logs.refetch()}
        />
      ) : null}

      {logs.data && items.length === 0 ? (
        <EmptyState
          title="No entries"
          description={
            debounced ? 'No entries match that action filter.' : 'Nothing has been recorded yet.'
          }
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {items.map((entry) => (
            <li key={entry.id} className="px-3.5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11.5px] text-ink">{entry.action}</span>
                <Badge tone={entry.actorType === 'ADMIN' ? 'accent' : 'muted'}>
                  {entry.actorType}
                </Badge>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                  {formatDateTime(entry.createdAt)}
                </span>
              </div>

              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                {entry.actorId ? <span>actor {entry.actorId}</span> : null}
                {entry.targetType ? (
                  <span>
                    target {entry.targetType}
                    {entry.targetId ? `:${entry.targetId}` : ''}
                  </span>
                ) : null}
              </p>

              {entry.metadata ? (
                <pre className="mt-1.5 overflow-x-auto rounded bg-raised/60 p-2 font-mono text-[10.5px] leading-relaxed text-muted">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {logs.hasNextPage ? (
        <div className="pt-3">
          <LoadMore
            onClick={() => void logs.fetchNextPage()}
            loading={logs.isFetchingNextPage}
            label="Load older entries"
          />
        </div>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Clear the audit log?"
        description="Every entry is deleted from the database. The clear operation itself is recorded, so the log is never left without a trace."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={clear.isPending}
              onClick={() =>
                clear.mutate(undefined, {
                  onSuccess: (result) => {
                    setConfirmOpen(false);
                    toast.push({
                      title: `${result.deleted} entr${result.deleted === 1 ? 'y' : 'ies'} deleted`,
                      tone: 'success',
                    });
                  },
                  onError: (error) =>
                    toast.push({
                      title: 'Could not clear the audit log',
                      description: errorMessage(error),
                      tone: 'error',
                    }),
                })
              }
            >
              Delete all entries
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">
          This cannot be undone. Export anything you need before continuing.
        </p>
      </Modal>
    </div>
  );
}
