import { RefreshCw } from 'lucide-react';
import { useAdminHealth } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { AdminHeader, HealthCard, HealthPill, type HealthState } from './adminUi';
import { ErrorState, LoadingBlock } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';

export function AdminHealthPage() {
  const health = useAdminHealth();

  if (health.isLoading) return <LoadingBlock label="Checking health" />;

  if (health.isError || !health.data) {
    return (
      <div>
        <AdminHeader title="Health" />
        <ErrorState
          title="Health could not load"
          description={errorMessage(health.error)}
          onRetry={() => void health.refetch()}
        />
      </div>
    );
  }

  const data = health.data;
  const uptime = data.api.uptimeSeconds;
  const uptimeLabel =
    uptime >= 86400
      ? `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h`
      : uptime >= 3600
        ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
        : `${Math.floor(uptime / 60)}m`;

  const apiState: HealthState = data.api.status === 'up' ? 'healthy' : 'unavailable';
  const databaseState: HealthState = data.database.status === 'up' ? 'healthy' : 'unavailable';
  // Background refreshes stop without a worker, but reading and posting still work.
  const workerState: HealthState =
    data.worker.status === 'up'
      ? 'healthy'
      : data.worker.lastSeenSecondsAgo === null
        ? 'unknown'
        : 'degraded';
  const moderationState: HealthState = data.moderation.configured ? 'healthy' : 'unknown';

  const integrations = [
    {
      label: 'YouTube trending',
      state: (data.youtube.configured ? 'healthy' : 'unknown') as HealthState,
      detail: data.youtube.configured ? 'configured' : 'not configured',
    },
    {
      label: 'Email delivery',
      state: (data.email.smtpConfigured ? 'healthy' : 'degraded') as HealthState,
      detail: data.email.transport === 'json' ? 'recorded, not delivered' : 'smtp',
    },
    {
      label: 'Link previews',
      state: (data.linkPreview.configured ? 'healthy' : 'unknown') as HealthState,
      detail: data.linkPreview.configured ? 'configured' : 'not configured',
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Health"
        description="Live dependency checks. This page answers even when the database is down."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<RefreshCw size={13} className={health.isFetching ? 'animate-spin' : undefined} />}
            onClick={() => void health.refetch()}
          >
            Re-check
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HealthCard
          label="API"
          state={apiState}
          primary={data.api.environment}
          details={[{ label: 'Uptime', value: uptimeLabel }]}
        />
        <HealthCard
          label="Database"
          state={databaseState}
          primary={data.database.status === 'up' ? 'Accepting queries' : 'Not reachable'}
          details={[
            {
              label: 'Latency',
              value: data.database.latencyMs !== null ? `${data.database.latencyMs} ms` : '—',
            },
          ]}
        />
        <HealthCard
          label="Worker"
          state={workerState}
          primary={
            data.worker.status === 'up'
              ? 'Refreshing content'
              : data.worker.lastSeenSecondsAgo === null
                ? 'Never seen'
                : 'Not running'
          }
          details={[
            {
              label: 'Heartbeat',
              value:
                data.worker.lastSeenSecondsAgo !== null
                  ? `${data.worker.lastSeenSecondsAgo}s ago`
                  : '—',
            },
            { label: 'Worker id', value: data.worker.workerId ?? '—' },
          ]}
        />
        <HealthCard
          label="Content moderation"
          state={moderationState}
          primary={data.moderation.configured ? 'Checks enabled' : 'Checks disabled'}
          details={[
            { label: 'Provider', value: data.moderation.provider },
            { label: 'Behaviour', value: data.moderation.configured ? 'enforced' : 'report-only' },
          ]}
        />
      </div>

      <h2 className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
        Integrations
      </h2>

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {integrations.map((integration) => (
          <li
            key={integration.label}
            className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3"
          >
            <div>
              <p className="text-[12.5px] font-medium text-ink">{integration.label}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                {integration.detail}
              </p>
            </div>
            <HealthPill state={integration.state} />
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11.5px] leading-relaxed text-subtle">
        A degraded worker means scheduled refreshes are paused: reading and posting keep working,
        but news, trending and podcast listings will not update.
      </p>
    </div>
  );
}
