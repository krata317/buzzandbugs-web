import { api } from './client';
import type { ApiEnvelope, LoginResponse, MeResponse, SessionInfo } from './types';

export const authApi = {
  me: (signal?: AbortSignal) =>
    api.get<ApiEnvelope<MeResponse>>('/auth/me', { signal }).then((response) => response.data),

  login: (identifier: string, password: string) =>
    api
      .post<ApiEnvelope<LoginResponse>>('/auth/login', { identifier, password }, { scope: 'none' })
      .then((response) => response.data),

  logout: () =>
    api.post<ApiEnvelope<{ status: string }>>('/auth/logout').then((response) => response.data),

  requestRegistrationOtp: (email: string) =>
    api
      .post<ApiEnvelope<{ status: string }>>(
        '/auth/register/request-otp',
        { email },
        { scope: 'none' },
      )
      .then((response) => response.data),

  verifyRegistrationOtp: (email: string, code: string) =>
    api
      .post<ApiEnvelope<{ registrationToken: string; expiresAt: string }>>(
        '/auth/register/verify-otp',
        { email, code },
        { scope: 'none' },
      )
      .then((response) => response.data),

  completeRegistration: (input: {
    registrationToken: string;
    username: string;
    displayName: string;
    password: string;
  }) =>
    api
      .post<ApiEnvelope<LoginResponse>>(
        '/auth/register/complete',
        input,
        { scope: 'none' },
      )
      .then((response) => response.data),

  requestPasswordReset: (email: string) =>
    api
      .post<ApiEnvelope<{ status: string }>>(
        '/auth/password/reset/request',
        { email },
        { scope: 'none' },
      )
      .then((response) => response.data),

  verifyPasswordReset: (email: string, code: string) =>
    api
      .post<ApiEnvelope<{ resetToken: string; expiresAt: string }>>(
        '/auth/password/reset/verify',
        { email, code },
        { scope: 'none' },
      )
      .then((response) => response.data),

  completePasswordReset: (resetToken: string, newPassword: string) =>
    api
      .post<ApiEnvelope<{ revokedSessions: number }>>(
        '/auth/password/reset/complete',
        { resetToken, newPassword },
        { scope: 'none' },
      )
      .then((response) => response.data),

  sessions: () =>
    api.get<ApiEnvelope<SessionInfo[]>>('/auth/sessions').then((response) => response.data),

  revokeSession: (id: string) =>
    api
      .delete<ApiEnvelope<{ status: string }>>(`/auth/sessions/${encodeURIComponent(id)}`)
      .then((response) => response.data),

  /**
   * The backend parses `includeCurrent` with `z.coerce.boolean()`, where the string
   * "false" is truthy. Omitting the parameter is therefore the only way to revoke
   * just the other sessions.
   */
  revokeOtherSessions: () =>
    api
      .delete<ApiEnvelope<{ revoked: number }>>('/auth/sessions')
      .then((response) => response.data),

  revokeAllSessions: () =>
    api
      .delete<ApiEnvelope<{ revoked: number }>>('/auth/sessions', {
        query: { includeCurrent: 'true' },
      })
      .then((response) => response.data),

  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
    confirmSessionRevocation: boolean;
  }) =>
    api
      .post<ApiEnvelope<{ revokedSessions: number }>>('/auth/password/change', input)
      .then((response) => response.data),

  requestAccountDeletion: (password: string) =>
    api
      .post<ApiEnvelope<{ status: string }>>('/auth/account-deletion/request', { password })
      .then((response) => response.data),

  confirmAccountDeletion: (code: string) =>
    api
      .post<ApiEnvelope<{ scheduledFor: string; graceDays: number }>>(
        '/auth/account-deletion/confirm',
        { code },
      )
      .then((response) => response.data),

  cancelAccountDeletion: () =>
    api
      .post<ApiEnvelope<{ status: string }>>('/auth/account-deletion/cancel')
      .then((response) => response.data),
};
