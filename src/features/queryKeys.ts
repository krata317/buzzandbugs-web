export const queryKeys = {
  me: ['me'] as const,
  settings: ['settings'] as const,
  health: ['health'] as const,

  feed: ['feed'] as const,
  post: (id: string) => ['post', id] as const,
  replies: (postId: string) => ['replies', postId] as const,

  profile: (username: string) => ['profile', username] as const,
  userPosts: (username: string) => ['user-posts', username] as const,
  userFollowers: (username: string) => ['user-followers', username] as const,
  userFollowing: (username: string) => ['user-following', username] as const,
  blocked: ['blocked'] as const,
  sessions: ['sessions'] as const,

  notifications: (unreadOnly: boolean) => ['notifications', unreadOnly] as const,
  unreadCount: ['notifications', 'unread-count'] as const,

  sections: (kind: string) => ['external', kind, 'sections'] as const,
  sectionPage: (kind: string, section: string) => ['external', kind, 'section', section] as const,

  adminMe: ['admin', 'me'] as const,
  adminOverview: ['admin', 'overview'] as const,
  adminUsers: (query: string) => ['admin', 'users', query] as const,
  adminUser: (id: string) => ['admin', 'user', id] as const,
  adminCases: (status: string) => ['admin', 'cases', status] as const,
  adminSources: ['admin', 'sources'] as const,
  adminHealth: ['admin', 'health'] as const,
  adminJobs: ['admin', 'jobs'] as const,
  adminAudit: (action: string) => ['admin', 'audit', action] as const,
};
