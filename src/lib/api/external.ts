import { api } from './client';
import type { ApiEnvelope, ExternalItem, ExternalSection, PageEnvelope } from './types';

export type ExternalKind = 'news' | 'events' | 'trending';

export const externalApi = {
  sections: (kind: ExternalKind, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<{ sections: ExternalSection[] }>>(`/${kind}`, { signal })
      .then((response) => response.data.sections),

  sectionPage: (
    kind: ExternalKind,
    section: string,
    options: { offset?: number; limit?: number; seed?: string; signal?: AbortSignal } = {},
  ) =>
    api
      .get<PageEnvelope<ExternalItem>>(`/${kind}/${encodeURIComponent(section)}`, {
        query: {
          offset: options.offset ?? 0,
          limit: options.limit,
          seed: options.seed,
        },
        signal: options.signal,
      })
      .then((response) => ({
        items: response.data,
        seed: response.meta.seed ?? options.seed ?? '',
        total: response.meta.total ?? response.data.length,
        hasMore: Boolean(response.meta.hasMore),
        offset: response.meta.offset ?? options.offset ?? 0,
      })),
};
