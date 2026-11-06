import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LogOut, Monitor, Smartphone } from 'lucide-react';
import { authApi, errorMessage } from '@/lib/api';
import type { SessionInfo } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';
import { formatDateTime, relativeTime } from '@/lib/format';
import { useToast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/feedback';
import { SettingsCard } from './SettingsLayout';

function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device';
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\//.test(userAgent)
      ? 'Opera'
      : /Chrome\//.test(userAgent)
        ? 'Chrome'
        : /Firefox\//.test(userAgent)
          ? 'Firefox'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : 'Browser';

  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /Mac OS X/.test(userAgent)
      ? 'macOS'
      : /Android/.test(userAgent)
        ? 'Android'
        : /iPhone|iPad/.test(userAgent)
          ? 'iOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : null;

  return os ? `${browser} on ${os}` : browser;
}

function isMobile(userAgent: string | null): boolean {
  return Boolean(userAgent && /Android|iPhone|iPad|Mobile/i.test(userAgent));
}

export function SessionSettings() {
  const sessions = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => authApi.sessions(),
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    void queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };

  const revoke = useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: () => {
      toast.push({ title: 'Session revoked', tone: 'success' });
      invalidate();
    },
    onError: (error) =>
      toast.push({
        title: 'Could not revoke the session',
        description: errorMessage(error),
        tone: 'error',
      }),
  });

  const revokeOthers = useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: (result) => {
      toast.push({
        title: `${result.revoked} other session${result.revoked === 1 ? '' : 's'} signed out`,
        tone: 'success',
      });
      invalidate();
    },
    onError: (error) =>
      toast.push({
        title: 'Could not revoke the sessions',
        description: errorMessage(error),
        tone: 'error',
      }),
  });

  const revokeAll = useMutation({
    mutationFn: () => authApi.revokeAllSessions(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.me, null);
      toast.push({ title: 'Signed out everywhere', tone: 'success' });
      navigate('/login', { replace: true });
    },
    onError: (error) =>
      toast.push({
        title: 'Could not revoke the sessions',
        description: errorMessage(error),
        tone: 'error',
      }),
  });

  if (sessions.isLoading) return <Skeleton className="h-72 w-full rounded-xl" />;

  const items: SessionInfo[] = sessions.data ?? [];

  return (
    <SettingsCard
      title="Active sessions"
      description="Sessions last 90 days and cannot be extended. Changing your password revokes every session."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<LogOut size={13} />}
            disabled={items.filter((session) => !session.current).length === 0}
            loading={revokeOthers.isPending}
            onClick={() => revokeOthers.mutate()}
          >
            Sign out other sessions
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={revokeAll.isPending}
            onClick={() => revokeAll.mutate()}
          >
            Sign out everywhere
          </Button>
        </div>
      }
    >
      {sessions.isError ? (
        <p className="text-[12.5px] text-danger">{errorMessage(sessions.error)}</p>
      ) : null}

      <ul className="divide-y divide-line">
        {items.map((session) => {
          const Icon = isMobile(session.userAgent) ? Smartphone : Monitor;
          return (
            <li key={session.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-raised text-subtle">
                <Icon size={15} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  {deviceLabel(session.userAgent)}
                  {session.current ? (
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-accent">
                      This device
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-subtle">
                  Active {relativeTime(session.lastUsedAt)} · expires{' '}
                  {formatDateTime(session.expiresAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                loading={revoke.isPending && revoke.variables === session.id}
                onClick={() => revoke.mutate(session.id)}
              >
                {session.current ? 'Sign out' : 'Revoke'}
              </Button>
            </li>
          );
        })}
      </ul>

      {items.length === 0 && !sessions.isError ? (
        <p className="py-4 text-[12.5px] text-muted">No active sessions were returned.</p>
      ) : null}
    </SettingsCard>
  );
}
