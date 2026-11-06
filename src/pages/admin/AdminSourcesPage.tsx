import { RefreshCw } from 'lucide-react';
import { useAdminSources, useRefreshSource } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { relativeTime } from '@/lib/format';
import { AdminHeader, AdminTable, StatusDot, Td, Th } from './adminUi';
import { ErrorState, LoadingBlock } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

export function AdminSourcesPage() {
  const sources = useAdminSources();
  const refresh = useRefreshSource();
  const toast = useToast();

  if (sources.isLoading) return <LoadingBlock label="Loading sources" />;

  if (sources.isError || !sources.data) {
    return (
      <div>
        <AdminHeader title="Sources" />
        <ErrorState
          title="Sources could not load"
          description={errorMessage(sources.error)}
          onRetry={() => void sources.refetch()}
        />
      </div>
    );
  }

  const groups = [
    { kind: 'NEWS', label: 'News' },
    { kind: 'EVENT', label: 'Events' },
    { kind: 'TRENDING', label: 'Trending' },
    { kind: 'PODCAST', label: 'Podcasts' },
  ] as const;

  return (
    <div>
      <AdminHeader
        title="Source health"
        description="Every external feed the worker refreshes, with the last attempt and the cached item count."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<RefreshCw size={13} className={sources.isFetching ? 'animate-spin' : undefined} />}
            onClick={() => void sources.refetch()}
          >
            Reload
          </Button>
        }
      />

      {groups.map((group) => {
        const rows = sources.data.filter((source) => source.kind === group.kind);
        if (rows.length === 0) return null;

        return (
          <section key={group.kind} className="mb-6">
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
              {group.label}
            </h2>
            <AdminTable>
              <thead>
                <tr>
                  <Th>Source</Th>
                  <Th>Section</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Items</Th>
                  <Th className="text-right">Latency</Th>
                  <Th>Last success</Th>
                  <Th>Error</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((source) => (
                  <tr key={source.key} className="transition-colors hover:bg-raised/40">
                    <Td>
                      <span className="font-medium text-ink">{source.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-subtle">{source.key}</span>
                    </Td>
                    <Td className="font-mono text-[11px] text-muted">{source.section}</Td>
                    <Td>
                      <StatusDot status={source.healthy ? 'up' : 'failed'} />
                      {source.consecutiveFailures > 0 ? (
                        <span className="ml-2 font-mono text-[10px] text-danger">
                          ×{source.consecutiveFailures}
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-right font-mono text-[11.5px]">{source.itemCount}</Td>
                    <Td className="text-right font-mono text-[11px] text-muted">
                      {source.responseTimeMs !== null ? `${source.responseTimeMs} ms` : '—'}
                    </Td>
                    <Td className="font-mono text-[10.5px] text-subtle">
                      {source.lastSuccessAt ? relativeTime(source.lastSuccessAt) : 'never'}
                    </Td>
                    <Td className="max-w-[220px]">
                      {source.lastError ? (
                        <span
                          className="line-clamp-2 text-[11px] leading-snug text-danger"
                          title={source.lastError}
                        >
                          {source.lastError}
                        </span>
                      ) : (
                        <span className="text-[11px] text-subtle">—</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={refresh.isPending && refresh.variables === source.key}
                        onClick={() =>
                          refresh.mutate(source.key, {
                            onSuccess: (result) =>
                              toast.push({
                                title:
                                  result.status === 'ok'
                                    ? `${source.name} refreshed`
                                    : `${source.name}: ${result.status}`,
                                description:
                                  result.status === 'ok'
                                    ? `${result.itemCount} items cached`
                                    : result.error,
                                tone: result.status === 'ok' ? 'success' : 'error',
                              }),
                            onError: (error) =>
                              toast.push({
                                title: 'Refresh failed',
                                description: errorMessage(error),
                                tone: 'error',
                              }),
                          })
                        }
                      >
                        Refresh
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </section>
        );
      })}

      <p className="text-[11.5px] leading-relaxed text-subtle">
        A refresh hits the upstream provider immediately and is recorded in the audit log. Retries
        are otherwise scheduled thirty minutes after a failure.
      </p>
    </div>
  );
}
