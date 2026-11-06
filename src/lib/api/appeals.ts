import { api } from './client';
import type { ApiEnvelope, AppealCase } from './types';

export const appealsApi = {
  read: (token: string, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<AppealCase>>(`/appeals/${encodeURIComponent(token)}`, {
        scope: 'none',
        signal,
      })
      .then((response) => response.data),

  submit: (token: string, message: string) =>
    api
      .post<ApiEnvelope<{ caseId: string; status: string }>>(
        `/appeals/${encodeURIComponent(token)}`,
        { message },
        { scope: 'none' },
      )
      .then((response) => response.data),
};
