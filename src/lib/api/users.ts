import { api, requestForm } from './client';
import type {
  ApiEnvelope,
  PageEnvelope,
  PostSummary,
  Profile,
  ProfileUpdate,
  PublicAuthor,
} from './types';

export const usersApi = {
  profile: (username: string, signal?: AbortSignal) =>
    api
      .get<ApiEnvelope<Profile>>(`/users/${encodeURIComponent(username)}`, { signal })
      .then((response) => response.data),

  posts: (username: string, options: { limit?: number; cursor?: string | null } = {}) =>
    api
      .get<PageEnvelope<PostSummary>>(`/users/${encodeURIComponent(username)}/posts`, {
        query: { limit: options.limit ?? 20, cursor: options.cursor ?? undefined },
      })
      .then((response) => ({
        items: response.data,
        nextCursor: response.meta.nextCursor ?? null,
        hasMore: Boolean(response.meta.hasMore),
      })),

  followers: (username: string, cursor?: string | null) =>
    api
      .get<PageEnvelope<PublicAuthor & { followedAt: string }>>(
        `/users/${encodeURIComponent(username)}/followers`,
        { query: { cursor: cursor ?? undefined } },
      )
      .then((response) => ({
        items: response.data,
        nextCursor: response.meta.nextCursor ?? null,
        hasMore: Boolean(response.meta.hasMore),
      })),

  following: (username: string, cursor?: string | null) =>
    api
      .get<PageEnvelope<PublicAuthor & { followedAt: string }>>(
        `/users/${encodeURIComponent(username)}/following`,
        { query: { cursor: cursor ?? undefined } },
      )
      .then((response) => ({
        items: response.data,
        nextCursor: response.meta.nextCursor ?? null,
        hasMore: Boolean(response.meta.hasMore),
      })),

  updateProfile: (input: ProfileUpdate) =>
    api
      .patch<
        ApiEnvelope<{
          id: string;
          username: string;
          displayName: string;
          about: string | null;
          socialLinks: Profile['socialLinks'];
          avatarUrl: string | null;
        }>
      >('/users/me', input)
      .then((response) => response.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return requestForm<ApiEnvelope<{ avatarUrl: string }>>('/users/me/avatar', form).then(
      (response) => response.data,
    );
  },

  follow: (username: string) =>
    api
      .post<ApiEnvelope<{ following: boolean }>>(
        `/users/${encodeURIComponent(username)}/follow`,
      )
      .then((response) => response.data),

  unfollow: (username: string) =>
    api
      .delete<ApiEnvelope<{ following: boolean }>>(
        `/users/${encodeURIComponent(username)}/follow`,
      )
      .then((response) => response.data),

  block: (username: string) =>
    api
      .post<ApiEnvelope<{ blocked: boolean }>>(
        `/users/${encodeURIComponent(username)}/block`,
      )
      .then((response) => response.data),

  unblock: (username: string) =>
    api
      .delete<ApiEnvelope<{ blocked: boolean }>>(
        `/users/${encodeURIComponent(username)}/block`,
      )
      .then((response) => response.data),

  blocked: () =>
    api.get<ApiEnvelope<PublicAuthor[]>>('/users/me/blocked').then((response) => response.data),
};
