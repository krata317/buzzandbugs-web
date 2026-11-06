import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import type { Profile, ProfileUpdate, PublicAuthor } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';

export function useProfile(username: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(username ?? ''),
    queryFn: ({ signal }) => usersApi.profile(username as string, signal),
    enabled: Boolean(username),
  });
}

export function useUserPosts(username: string | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.userPosts(username ?? ''),
    queryFn: ({ pageParam }) => usersApi.posts(username as string, { cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    enabled: Boolean(username),
  });
}

type DirectoryPage = { items: Array<PublicAuthor & { followedAt: string }>; nextCursor: string | null; hasMore: boolean };

export function useFollowers(username: string | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.userFollowers(username ?? ''),
    queryFn: ({ pageParam }) => usersApi.followers(username as string, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last: DirectoryPage) => (last.hasMore ? last.nextCursor : undefined),
    enabled: Boolean(username),
  });
}

export function useFollowing(username: string | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.userFollowing(username ?? ''),
    queryFn: ({ pageParam }) => usersApi.following(username as string, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last: DirectoryPage) => (last.hasMore ? last.nextCursor : undefined),
    enabled: Boolean(username),
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { username: string; follow: boolean }) =>
      input.follow ? usersApi.follow(input.username) : usersApi.unfollow(input.username),

    onMutate: async ({ username, follow }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile(username) });
      const previous = queryClient.getQueryData<Profile>(queryKeys.profile(username));

      queryClient.setQueryData<Profile>(queryKeys.profile(username), (profile) => {
        if (!profile) return profile;
        const followers =
          profile.stats.followers === null
            ? null
            : Math.max(0, profile.stats.followers + (follow ? 1 : -1));
        return {
          ...profile,
          viewer: { ...profile.viewer, isFollowing: follow },
          stats: { ...profile.stats, followers },
        };
      });

      return { previous };
    },

    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.profile(variables.username), context.previous);
      }
    },

    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.username) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
    },
  });
}

export function useBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { username: string; block: boolean }) =>
      input.block ? usersApi.block(input.username) : usersApi.unblock(input.username),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocked });
      void queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.username) });
    },
  });
}

export function useBlockedUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.blocked,
    queryFn: () => usersApi.blocked(),
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdate) => usersApi.updateProfile(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.profile(updated.username), (profile: Profile | undefined) =>
        profile
          ? {
              ...profile,
              displayName: updated.displayName,
              about: updated.about,
              socialLinks: updated.socialLinks,
              avatarUrl: updated.avatarUrl,
            }
          : profile,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

