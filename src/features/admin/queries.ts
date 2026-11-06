import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import type { AuditEntry, ModerationStatus, PageMeta } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';

export function useAdminMe() {
  const { isLoading } = useAuth();
  return useQuery({
    queryKey: queryKeys.adminMe,
    queryFn: ({ signal }) => adminApi.me(signal),
    retry: false,
    staleTime: 60_000,
    enabled: !isLoading,
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.adminOverview,
    queryFn: ({ signal }) => adminApi.overview(signal),
    refetchInterval: 60_000,
  });
}

export function useAdminUsers(query: string) {
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: ({ signal }) => adminApi.users(query, signal),
    enabled: query.trim().length > 0,
    staleTime: 15_000,
  });
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.adminUser(id ?? ''),
    queryFn: ({ signal }) => adminApi.user(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useAdminCases(status: string) {
  return useQuery({
    queryKey: queryKeys.adminCases(status),
    queryFn: ({ signal }) =>
      adminApi.cases(status === 'all' ? undefined : (status as ModerationStatus), signal),
    refetchInterval: 45_000,
  });
}

export function useDecideCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; decision: 'accept' | 'reject'; note?: string }) =>
      adminApi.decide(input.id, input.decision, input.note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cases'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}

export function useAdminSources() {
  return useQuery({
    queryKey: queryKeys.adminSources,
    queryFn: ({ signal }) => adminApi.sources(signal),
  });
}

export function useRefreshSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => adminApi.refreshSource(key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSources });
    },
  });
}

export function useAdminHealth() {
  return useQuery({
    queryKey: queryKeys.adminHealth,
    queryFn: ({ signal }) => adminApi.health(signal),
    refetchInterval: 30_000,
  });
}

export function useAdminJobs() {
  return useQuery({
    queryKey: queryKeys.adminJobs,
    queryFn: ({ signal }) => adminApi.jobs(signal),
    refetchInterval: 60_000,
  });
}

export function useAdminAudit(action: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.adminAudit(action),
    queryFn: ({ pageParam }) =>
      adminApi.auditLogs({ cursor: pageParam, action, limit: 25 }),
    initialPageParam: null as string | null,
    getNextPageParam: (last: {
      items: AuditEntry[];
      nextCursor: string | null;
      hasMore: boolean;
      meta?: PageMeta;
    }) => (last.hasMore ? last.nextCursor : undefined),
  });
}
