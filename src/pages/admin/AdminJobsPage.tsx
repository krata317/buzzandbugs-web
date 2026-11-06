import { useAdminJobs } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { AdminHeader, AdminTable, Td, Th } from './adminUi';
import { EmptyState, ErrorState, LoadingBlock } from '@/components/ui/feedback';

export function AdminJobsPage() {
  const jobs = useAdminJobs();

  if (jobs.isLoading) return <LoadingBlock label="Loading job queues" />;

  if (jobs.isError || !jobs.data) {
    return (
      <div>
        <AdminHeader title="Background jobs" />
        <ErrorState
          title="Job status could not load"
          description={errorMessage(jobs.error)}
          onRetry={() => void jobs.refetch()}
        />
      </div>
    );
  }

  const { queues, recentFailures } = jobs.data;

  const grouped = new Map<string, Array<{ state: string; count: number }>>();
  for (const queue of queues) {
    const list = grouped.get(queue.name) ?? [];
    list.push({ state: queue.state, count: queue.count });
    grouped.set(queue.name, list);
  }

  return (
    <div>
      <AdminHeader
        title="Background jobs"
        description="Queue depth for the last seven days, read directly from the pg-boss tables."
      />

      {queues.length === 0 ? (
        <EmptyState
          title="No job history"
          description="The worker has not created jobs yet, or pg-boss tables are not readable with the current database role."
        />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>Queue</Th>
              <Th>States</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {[...grouped.entries()].map(([name, states]) => (
              <tr key={name} className="transition-colors hover:bg-raised/40">
                <Td className="font-mono text-[11.5px]">{name}</Td>
                <Td>
                  <span className="flex flex-wrap gap-1.5">
                    {states.map((state) => (
                      <span
                        key={state.state}
                        className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted"
                      >
                        {state.state} {state.count}
                      </span>
                    ))}
                  </span>
                </Td>
                <Td className="text-right font-mono text-[11.5px]">
                  {states.reduce((total, state) => total + state.count, 0)}
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <h2 className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
        Recent failures
      </h2>

      {recentFailures.length === 0 ? (
        <p className="text-[12.5px] text-muted">No failed jobs recorded.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {recentFailures.map((failure) => (
            <li key={failure.id} className="px-3.5 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[11.5px] text-ink">{failure.queue}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                  {formatDateTime(failure.createdAt)}
                </p>
              </div>
              <pre className="mt-1 overflow-x-auto rounded bg-raised/60 p-2 font-mono text-[10.5px] leading-relaxed text-muted">
                {JSON.stringify(failure.data, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
