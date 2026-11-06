import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';

export interface HealthPayload {
  status: string;
  database: { status: string; latencyMs: number | null };
  worker: { status: string; lastSeenSecondsAgo: number | null };
  api: { status: string };
}

export interface ConnectionState {
  browserOnline: boolean;
  /** null while the first probe is in flight. */
  apiReachable: boolean | null;
  degraded: boolean;
  workerUp: boolean | null;
  checking: boolean;
  recheck: () => void;
}

export function useConnection(): ConnectionState {
  const [browserOnline, setBrowserOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const online = () => setBrowserOnline(true);
    const offline = () => setBrowserOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: async ({ signal }) => {
      const response = await api.get<{ data: HealthPayload }>('/health', {
        scope: 'none',
        signal,
        timeoutMs: 8000,
      });
      return response.data;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
    retry: false,
  });

  const apiReachable =
    healthQuery.data !== undefined ? true : healthQuery.isError ? false : null;

  const degraded =
    healthQuery.data !== undefined &&
    (healthQuery.data.database.status !== 'up' || healthQuery.data.status !== 'ok');

  return {
    browserOnline,
    apiReachable,
    degraded,
    workerUp: healthQuery.data ? healthQuery.data.worker.status === 'up' : null,
    checking: healthQuery.isFetching,
    recheck: () => {
      void healthQuery.refetch();
    },
  };
}
