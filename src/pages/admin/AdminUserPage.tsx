import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAdminUser } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/format';
import { AdminHeader, StatCard } from './adminUi';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, ErrorState, LoadingBlock } from '@/components/ui/feedback';

export function AdminUserPage() {
  const { id } = useParams();
  const user = useAdminUser(id);

  if (user.isLoading) return <LoadingBlock label="Loading account" />;

  if (user.isError || !user.data) {
    return (
      <div>
        <BackLink />
        <ErrorState
          title="Account could not load"
          description={errorMessage(user.error)}
          onRetry={() => void user.refetch()}
        />
      </div>
    );
  }

  const data = user.data;

  return (
    <div>
      <BackLink />

      <AdminHeader
        title={data.displayName}
        description={`@${data.username} · ${data.email} · joined ${formatDate(data.createdAt)}`}
        actions={
          data.ban.banned ? (
            <Badge tone="danger">{data.ban.permanent ? 'Permanently banned' : 'Banned'}</Badge>
          ) : (
            <Badge tone="success">Active</Badge>
          )
        }
      />

      <div className="flex items-start gap-4">
        <Avatar src={data.avatarUrl} name={data.displayName} size="lg" ring />
        <div className="min-w-0">
          {data.about ? (
            <p className="max-w-2xl whitespace-pre-line text-[12.5px] leading-relaxed text-muted">
              {data.about}
            </p>
          ) : (
            <p className="text-[12.5px] text-subtle">No profile biography.</p>
          )}
          {data.ban.banned ? (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-danger">
              <ShieldAlert size={12} aria-hidden="true" />
              {data.ban.permanent
                ? 'Permanent ban'
                : `Banned until ${data.ban.until ? formatDateTime(data.ban.until) : 'unknown'}`}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard label="Posts" value={data.stats.posts} />
        <StatCard label="Replies" value={data.stats.replies} />
        <StatCard label="Followers" value={data.stats.followers} />
        <StatCard
          label="Active warnings"
          value={data.activeWarnings}
          tone={data.activeWarnings > 0 ? 'warning' : 'default'}
        />
      </div>

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
          Warnings
        </h2>
        {data.warnings.length === 0 ? (
          <p className="text-[12.5px] text-muted">No warnings recorded.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {data.warnings.map((warning) => (
              <li key={warning.id} className="px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[12.5px] text-ink">{warning.reason}</p>
                  {warning.revokedAt ? (
                    <Badge tone="muted">Revoked</Badge>
                  ) : new Date(warning.expiresAt).getTime() < Date.now() ? (
                    <Badge tone="muted">Expired</Badge>
                  ) : (
                    <Badge tone="warning">Active</Badge>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                  {formatDateTime(warning.createdAt)} · expires {formatDateTime(warning.expiresAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">Bans</h2>
        {data.bans.length === 0 ? (
          <p className="text-[12.5px] text-muted">No bans recorded.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {data.bans.map((ban) => (
              <li key={ban.id} className="px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[12.5px] text-ink">{ban.reason}</p>
                  {ban.permanent ? (
                    <Badge tone="danger">Permanent</Badge>
                  ) : ban.liftedAt ? (
                    <Badge tone="muted">Lifted</Badge>
                  ) : (
                    <Badge tone="warning">Active</Badge>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-subtle">
                  {formatDateTime(ban.startsAt)}
                  {ban.endsAt ? ` → ${formatDateTime(ban.endsAt)}` : ' → no end date'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-[11.5px] text-subtle">
        This view is recorded in the audit log as <code className="font-mono">admin.user_view</code>.
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/users"
      className="focus-ring mb-4 inline-flex items-center gap-1.5 rounded-md text-[12px] text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={12} aria-hidden="true" />
      User lookup
    </Link>
  );
}
