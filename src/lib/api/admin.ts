import { api } from './client';
import type {
  AdminCase,
  AdminHealth,
  AdminIdentity,
  AdminJobs,
  AdminOverview,
  AdminSource,
  AdminUserDetail,
  AdminUserRow,
  ApiEnvelope,
  AuditEntry,
  ModerationStatus,
  PageEnvelope,
} from './types';

const scope = 'admin' as const;

export const adminApi = {
  login: (username: string, password: string) =>
    api
      .post<ApiEnvelope<{ admin: AdminIdentity; expiresAt: string }>>(
        '/admin/auth/login',
        { username, password },
        { scope: 'none' },
      )
      .then((response) => response.data),

  logout: () =>
    api
      .post<ApiEnvelope<{ status: string }>>('/admin/auth/logout', undefined, { scope })
      .then((response) => response.data),

  me: (signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminIdentity>>('/admin/auth/me', { scope, signal })
      .then((response) => response.data),

  overview: (signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminOverview>>('/admin/overview', { scope, signal })
      .then((response) => response.data),

  users: (query: string, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminUserRow[]>>('/admin/users', { scope, query: { query }, signal })
      .then((response) => response.data),

  user: (id: string, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminUserDetail>>(`/admin/users/${encodeURIComponent(id)}`, {
        scope,
        signal,
      })
      .then((response) => response.data),

  cases: (status?: ModerationStatus, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminCase[]>>('/admin/moderation/cases', {
        scope,
        query: { status },
        signal,
      })
      .then((response) => response.data),

  decide: (id: string, decision: 'accept' | 'reject', note?: string) =>
    api
      .post<ApiEnvelope<{ id: string; status: string }>>(
        `/admin/moderation/cases/${encodeURIComponent(id)}/decision`,
        { decision, note },
        { scope },
      )
      .then((response) => response.data),

  sources: (signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminSource[]>>('/admin/sources', { scope, signal })
      .then((response) => response.data),

  refreshSource: (key: string) =>
    api
      .post<ApiEnvelope<{ key: string; status: string; itemCount: number; error?: string }>>(
        `/admin/sources/${encodeURIComponent(key)}/refresh`,
        undefined,
        { scope },
      )
      .then((response) => response.data),

  health: (signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminHealth>>('/admin/health', { scope, signal })
      .then((response) => response.data),

  jobs: (signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AdminJobs>>('/admin/jobs', { scope, signal })
      .then((response) => response.data),

  auditLogs: (options: { cursor?: string | null; action?: string; limit?: number } = {}) =>
    api
      .get<PageEnvelope<AuditEntry>>('/admin/audit-logs', {
        scope,
        query: {
          cursor: options.cursor ?? undefined,
          action: options.action || undefined,
          limit: options.limit ?? 25,
        },
      })
      .then((response) => ({
        items: response.data,
        nextCursor: response.meta.nextCursor ?? null,
        hasMore: Boolean(response.meta.hasMore),
      })),
};
