import { api } from './client';
import type {
  ApiEnvelope,
  FeedPage,
  PageEnvelope,
  PostDetail,
  PostSummary,
  Reply,
  ReportReason,
  RichTextDoc,
  VoteResult,
  VoteValue,
} from './types';

const toFeedPage = (page: PageEnvelope<PostSummary>): FeedPage => ({
  items: page.data,
  nextCursor: page.meta.nextCursor ?? null,
  hasMore: Boolean(page.meta.hasMore),
});

export const postsApi = {
  feed: async (
    options: { limit?: number; cursor?: string | null; signal?: AbortSignal } = {},
  ): Promise<FeedPage> =>
    toFeedPage(
      await api.get<PageEnvelope<PostSummary>>('/feed', {
        query: { limit: options.limit ?? 20, cursor: options.cursor ?? undefined },
        signal: options.signal,
      }),
    ),

  detail: (id: string, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<PostDetail>>(`/posts/${encodeURIComponent(id)}`, { signal })
      .then((response) => response.data),

  create: (input: { title: string; content?: RichTextDoc; repostOfId?: string }) =>
    api
      .post<ApiEnvelope<{ id: string }>>('/posts', input)
      .then((response) => response.data),

  update: (id: string, input: { title?: string; content?: RichTextDoc }) =>
    api
      .patch<ApiEnvelope<PostDetail>>(`/posts/${encodeURIComponent(id)}`, input)
      .then((response) => response.data),

  remove: (id: string) =>
    api
      .delete<ApiEnvelope<{ status: string }>>(`/posts/${encodeURIComponent(id)}`)
      .then((response) => response.data),

  vote: (id: string, value: VoteValue) =>
    api
      .post<ApiEnvelope<VoteResult>>(`/posts/${encodeURIComponent(id)}/vote`, { value })
      .then((response) => response.data),

  replies: (id: string, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<Reply[]>>(`/posts/${encodeURIComponent(id)}/replies`, { signal })
      .then((response) => response.data),

  reply: (id: string, input: { content: RichTextDoc; parentId?: string | null }) =>
    api
      .post<ApiEnvelope<{ id: string }>>(`/posts/${encodeURIComponent(id)}/replies`, input)
      .then((response) => response.data),

  deleteReply: (replyId: string) =>
    api
      .delete<ApiEnvelope<{ status: string }>>(`/replies/${encodeURIComponent(replyId)}`)
      .then((response) => response.data),

  report: (id: string, input: { reason: ReportReason; details?: string }) =>
    api
      .post<ApiEnvelope<{ status: string; caseId: string }>>(
        `/posts/${encodeURIComponent(id)}/report`,
        input,
      )
      .then((response) => response.data),
};
