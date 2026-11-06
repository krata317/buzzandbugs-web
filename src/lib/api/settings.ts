import { api } from './client';
import type { ApiEnvelope, Settings, SettingsPatch } from './types';

export const settingsApi = {
  read: (signal?: AbortSignal) =>
    api.get<ApiEnvelope<Settings>>('/settings', { signal }).then((response) => response.data),

  update: (patch: SettingsPatch) =>
    api.patch<ApiEnvelope<Settings>>('/settings', patch).then((response) => response.data),
};
