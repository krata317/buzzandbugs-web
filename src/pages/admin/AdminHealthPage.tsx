import { Activity, RefreshCw } from 'lucide-react';
import { useAdminHealth } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { AdminHeader, StatCard, StatusDot } from './adminUi';
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

  const integrations = [
    { label: 'Content moderation', ready: data.moderation.configured, detail: data.moderation.provider },
    { label: 'YouTube trending', ready: data.youtube.configured, detail: 'YOUTUBE_API_KEY' },
    {
      label: 'Email delivery',
      ready: data.email.smtpConfigured,
      detail: data.email.transport === 'json' ? 'json transport (no delivery)' : 'smtp',
    },
    { label: 'Link previews', ready: data.linkPreview.configured, detail: 'linkpreview.net' },
  ];

  return (
    <div>
      <AdminHeader
        title="Health"
        description="Live dependency checks. The API answers this request even when the database is down."
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">API</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-[18px] leading-none text-ink">
              {data.api.status}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
              {data.api.environment}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[10.5px] text-subtle">uptime {uptimeLabel}</p>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">Database</p>
          <div className="mt-1.5">
            <StatusDot status={data.database.status} />
          </div>
          <p className="mt-1.5 font-mono text-[10.5px] text-subtle">
            {data.database.latencyMs !== null ? `${data.database.latencyMs} ms round trip` : 'no latency'}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">Worker</p>
          <div className="mt-1.5">
            <StatusDot status={data.worker.status} />
          </div>
          <p className="mt-1.5 font-mono text-[10.5px] text-subtle">
            {data.worker.lastSeenSecondsAgo !== null
              ? `heartbeat ${data.worker.lastSeenSecondsAgo}s ago`
              : 'no heartbeat recorded'}
          </p>
        </div>
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
            <span
              className={
                integration.ready
                  ? 'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400'
                  : 'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle'
              }
            >
              <Activity size={11} aria-hidden="true" />
              {integration.ready ? 'configured' : 'not configured'}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <StatCard
          label="Moderation"
          value={data.moderation.configured ? 'on' : 'off'}
          hint={
            data.moderation.configured
              ? 'Report triage and edit checks are available.'
              : 'Edits are refused with 503 and reports stay in PROVIDER_FAILED.'
          }
          tone={data.moderation.configured ? 'default' : 'warning'}
        />
        <StatCard
          label="Worker"
          value={data.worker.status}
          hint={
            data.worker.status === 'up'
              ? 'Scheduled refreshes and queued email are running.'
              : 'Start it with npm run dev:worker in the backend.'
          }
          tone={data.worker.status === 'up' ? 'default' : 'warning'}
        />
      </div>
    </div>
  );
}
