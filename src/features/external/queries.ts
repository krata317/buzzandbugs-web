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

interface SectionParam {
  offset: number;
  seed?: string;
}

export function useSectionItems(kind: ExternalKind, section: string, pageSize = 12) {
  return useInfiniteQuery({
    queryKey: queryKeys.sectionPage(kind, section),
    queryFn: ({ pageParam, signal }) =>
      externalApi.sectionPage(kind, section, {
        offset: pageParam.offset,
        seed: pageParam.seed,
        limit: pageSize,
        signal,
      }),
    initialPageParam: { offset: 0 } as SectionParam,
    getNextPageParam: (last) =>
      last.hasMore ? { offset: last.offset + last.items.length, seed: last.seed } : undefined,
    staleTime: 2 * 60_000,
  });
}
