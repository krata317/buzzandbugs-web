import { api } from './client';
import type { ApiEnvelope, AppNotification, PageEnvelope } from './types';

export const notificationsApi = {
  list: (options: { unreadOnly?: boolean; cursor?: string | null; limit?: number } = {}) =>
    api
      .get<PageEnvelope<AppNotification>>('/notifications', {
        query: {
          limit: options.limit ?? 20,
          cursor: options.cursor ?? undefined,
          unreadOnly: options.unreadOnly ? 'true' : undefined,
        },
      })
      .then((response) => ({
        items: response.data,
        nextCursor: response.meta.nextCursor ?? null,
        hasMore: Boolean(response.meta.hasMore),
      })),

  unreadCount: (signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<{ count: number }>>('/notifications/unread-count', { signal })
      .then((response) => response.data.count),

  markRead: (id: string) =>
    api
      .post<ApiEnvelope<{ status: string }>>(`/notifications/${encodeURIComponent(id)}/read`)
      .then((response) => response.data),

  markAllRead: () =>
    api
      .post<ApiEnvelope<{ updated: number }>>('/notifications/read-all')
      .then((response) => response.data),

  remove: (id: string) =>
    api
      .delete<ApiEnvelope<{ status: string }>>(`/notifications/${encodeURIComponent(id)}`)
      .then((response) => response.data),
};
