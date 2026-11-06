import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import type { AppNotification, PageMeta } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: ({ signal }) => notificationsApi.unreadCount(signal),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
}

export function useNotifications(unreadOnly: boolean) {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.notifications(unreadOnly),
    queryFn: ({ pageParam }) =>
      notificationsApi.list({ unreadOnly, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last: { items: AppNotification[]; nextCursor: string | null; hasMore: boolean }) =>
      last.hasMore ? last.nextCursor : undefined,
    enabled: isAuthenticated,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: invalidate,
  });

  return { markRead, markAllRead, remove };
}

export type { PageMeta };
