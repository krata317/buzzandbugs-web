import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { externalApi, type ExternalKind } from '@/lib/api';
import { queryKeys } from '@/features/queryKeys';

export function useSections(kind: ExternalKind, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sections(kind),
    queryFn: ({ signal }) => externalApi.sections(kind, signal),
    staleTime: 2 * 60_000,
    enabled,
  });
}

export function useSectionItems(kind: ExternalKind, section: string, pageSize = 12) {
  return useInfiniteQuery({
    queryKey: queryKeys.sectionPage(kind, section),
    queryFn: ({ pageParam, signal }) =>
      externalApi.sectionPage(kind, section, {
        offset: pageParam,
        limit: pageSize,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasMore ? last.offset + last.items.length : undefined),
    staleTime: 2 * 60_000,
  });
}
