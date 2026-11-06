import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import type {
  FeedPage,
  PostDetail,
  PostSummary,
  ReportReason,
  RichTextDoc,
  VoteValue,
} from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';

type FeedData = InfiniteData<FeedPage>;

function patchFeed(
  data: FeedData | undefined,
  postId: string,
  patch: (post: PostSummary) => PostSummary,
): FeedData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((post) => (post.id === postId ? patch(post) : post)),
    })),
  };
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed,
    queryFn: ({ pageParam, signal }) => postsApi.feed({ cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    staleTime: 20_000,
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: ({ signal }) => postsApi.detail(postId, signal),
    enabled: Boolean(postId),
  });
}

export function useReplies(postId: string) {
  return useQuery({
    queryKey: queryKeys.replies(postId),
    queryFn: ({ signal }) => postsApi.replies(postId, signal),
    enabled: Boolean(postId),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; content?: RichTextDoc; repostOfId?: string }) =>
      postsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title?: string; content?: RichTextDoc }) =>
      postsApi.update(postId, input),
    onSuccess: (post) => {
      queryClient.setQueryData(queryKeys.post(postId), post);
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsApi.remove(postId),
    onSuccess: (_result, postId) => {
      queryClient.removeQueries({ queryKey: queryKeys.post(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; value: VoteValue; previous: number }) =>
      postsApi.vote(input.id, input.value),

    onMutate: async ({ id, value, previous }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.feed });
      const delta = value - previous;

      queryClient.setQueriesData<FeedData>({ queryKey: queryKeys.feed }, (data) =>
        patchFeed(data, id, (post) => ({
          ...post,
          score: post.score + delta,
          viewerVote: value,
        })),
      );

      queryClient.setQueriesData<FeedData>({ queryKey: ['user-posts'] }, (data) =>
        patchFeed(data, id, (post) => ({
          ...post,
          score: post.score + delta,
          viewerVote: value,
        })),
      );

      queryClient.setQueryData<PostDetail>(queryKeys.post(id), (post) =>
        post ? { ...post, score: post.score + delta, viewerVote: value } : post,
      );
    },

    onError: (_error, variables) => {
      queryClient.setQueriesData<FeedData>({ queryKey: queryKeys.feed }, (data) =>
        patchFeed(data, variables.id, (post) => ({
          ...post,
          score: post.score - (variables.value - variables.previous),
          viewerVote: variables.previous,
        })),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.post(variables.id) });
    },

    onSuccess: (result, variables) => {
      queryClient.setQueryData<PostDetail>(queryKeys.post(variables.id), (post) =>
        post ? { ...post, score: result.score, viewerVote: result.viewerVote } : post,
      );
    },
  });
}

export function useCreateReply(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { content: RichTextDoc; parentId?: string | null }) =>
      postsApi.reply(postId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.replies(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useDeleteReply(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => postsApi.deleteReply(replyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.replies(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useReportPost(postId: string) {
  return useMutation({
    mutationFn: (input: { reason: ReportReason; details?: string }) =>
      postsApi.report(postId, input),
  });
}
