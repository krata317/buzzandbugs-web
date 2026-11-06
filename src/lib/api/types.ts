/** Shapes returned by the Buzz and Bugs API. Kept in one place so the UI never guesses. */

export interface ApiEnvelope<T> {
  data: T;
}

export interface PageMeta {
  nextCursor?: string | null;
  hasMore?: boolean;
  limit?: number;
  offset?: number;
  total?: number;
  seed?: string;
}

export interface PageEnvelope<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type VoteValue = -1 | 0 | 1;

/* ------------------------------------------------------------------ users */

export interface PublicAuthor {
  id: string | null;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string;
  deleted: boolean;
}

export type SocialKey = 'instagram' | 'x' | 'linkedin' | 'github' | 'youtube' | 'website';

export type SocialLinks = Partial<Record<SocialKey, string>>;

export interface BanState {
  banned: boolean;
  permanent: boolean;
  until: string | null;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  profileUrl: string;
  about: string | null;
  socialLinks: SocialLinks;
  createdAt: string;
  stats: {
    posts: number;
    followers: number | null;
    following: number | null;
  };
  viewer: {
    isSelf: boolean;
    isFollowing: boolean;
    followsYou: boolean;
  };
  ban: BanState | null;
}

export interface ProfileUpdate {
  displayName?: string;
  about?: string | null;
  socialLinks?: SocialLinks;
}

/* ------------------------------------------------------------------- buzz */

export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  text?: string;
  marks?: RichTextMark[];
}

export interface RichTextDoc {
  type: 'doc';
  content?: RichTextNode[];
}

export interface RepostTarget {
  id: string;
  title: string;
  excerpt: string;
  author: PublicAuthor;
  available: boolean;
  url: string;
}

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  kind: 'POST' | 'REPOST';
  score: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  url: string;
  author: PublicAuthor;
  viewerVote: number;
  repostOf: RepostTarget | null;
}

export interface PostDetail extends Omit<PostSummary, 'repostOf'> {
  content: RichTextNode | null;
  repostOf: (RepostTarget & { content: RichTextNode | null }) | null;
  moderation: { status: string; appealDeadline: string | null } | null;
}

export interface Reply {
  id: string;
  postId: string;
  parentId: string | null;
  depth: number;
  excerpt: string;
  content: RichTextNode | null;
  createdAt: string;
  deleted: boolean;
  author: PublicAuthor;
}

export interface VoteResult {
  score: number;
  viewerVote: number;
}

export interface FeedPage {
  items: PostSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'MISINFORMATION'
  | 'SEXUAL_CONTENT'
  | 'VIOLENCE'
  | 'SELF_HARM'
  | 'OTHER';

/* -------------------------------------------------------------- external */

export interface ExternalItem {
  id: string;
  source: string;
  section: string;
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  startsAt: string | null;
  endsAt: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ExternalSection {
  section: string;
  seed: string;
  total: number;
  hasMore: boolean;
  items: ExternalItem[];
}

/* ------------------------------------------------------------------ auth */

export interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  about?: string | null;
  socialLinks?: SocialLinks;
  avatarUrl: string | null;
  profileUrl: string;
  createdAt: string;
}

export type DisplayMode = 'light' | 'dark' | 'system';
export type AccentColor = 'violet' | 'blue' | 'green' | 'amber' | 'rose' | 'teal' | 'slate';
export type NewsSection = 'trending' | 'ai' | 'security' | 'leaders' | 'india';
export type EventSection = 'hackathons' | 'contests' | 'ctf';
export type TrendingSection =
  | 'youtube'
  | 'repositories'
  | 'models'
  | 'datasets'
  | 'papers'
  | 'podcasts';

export interface ChannelPrefs {
  onPlatform: boolean;
  email: boolean;
}

export interface NotificationPrefs {
  social: ChannelPrefs;
  account: ChannelPrefs;
  community: ChannelPrefs;
  content: ChannelPrefs;
}

export interface ProfileVisibility {
  about: boolean;
  socialLinks: boolean;
  followers: boolean;
  following: boolean;
}

export interface Settings {
  displayMode: DisplayMode;
  accentColor: AccentColor;
  newsOrder: NewsSection[];
  eventsOrder: EventSection[];
  trendingOrder: TrendingSection[];
  profileVisibility: ProfileVisibility;
  notificationPrefs: NotificationPrefs;
}

export type SettingsPatch = Partial<{
  displayMode: DisplayMode;
  accentColor: AccentColor;
  newsOrder: NewsSection[];
  eventsOrder: EventSection[];
  trendingOrder: TrendingSection[];
  profileVisibility: Partial<ProfileVisibility>;
  notificationPrefs: Partial<Record<keyof NotificationPrefs, Partial<ChannelPrefs>>>;
}>;

export interface MeResponse {
  user: CurrentUser;
  stats: { posts: number; followers: number; following: number };
  settings: Settings | null;
  pendingDeletion: { scheduledFor: string } | null;
  ban: BanState;
  session: { id: string; expiresAt: string; via: 'cookie' | 'bearer' };
}

export interface LoginResponse {
  user: CurrentUser;
  pendingDeletion: boolean;
  ban: BanState;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  userAgent: string | null;
  current: boolean;
}

/* --------------------------------------------------------- notifications */

export type NotificationCategory = 'SOCIAL' | 'ACCOUNT' | 'COMMUNITY' | 'CONTENT';

export interface AppNotification {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  expiresAt: string;
}

/* ------------------------------------------------------------ moderation */

export interface AppealCase {
  caseId: string;
  status: string;
  postTitle: string;
  postHiddenAt: string;
  appealDeadline: string | null;
  appealUsed: boolean;
  canAppeal: boolean;
  providerCategories: unknown;
}

/* ----------------------------------------------------------------- admin */

export interface AdminIdentity {
  id: string;
  username: string;
}

export interface AdminOverview {
  users: number;
  newUsersLast7Days: number;
  posts: number;
  postsLast24Hours: number;
  replies: number;
  reports: number;
  openCases: number;
  awaitingAppeal: number;
  bannedUsers: number;
  pendingDeletions: number;
}

export interface AdminUserRow {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  postCount: number;
  warningCount: number;
  ban: BanState;
}

export interface AdminUserDetail extends PublicAuthor {
  email: string;
  about: string | null;
  createdAt: string;
  stats: { posts: number; replies: number; followers: number; following: number };
  activeWarnings: number;
  ban: BanState;
  warnings: Array<{
    id: string;
    reason: string;
    createdAt: string;
    expiresAt: string;
    revokedAt: string | null;
  }>;
  bans: Array<{
    id: string;
    reason: string;
    startsAt: string;
    endsAt: string | null;
    permanent: boolean;
    liftedAt: string | null;
  }>;
}

export type ModerationStatus =
  | 'PENDING_PROVIDER'
  | 'PROVIDER_FAILED'
  | 'AWAITING_APPEAL'
  | 'APPEALED'
  | 'RESOLVED_KEPT'
  | 'RESOLVED_REMOVED';

export interface AdminCase {
  id: string;
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
  appealExpiresAt: string | null;
  appealMessage: string | null;
  reportCount: number;
  providerCategories: unknown;
  post: {
    id: string;
    title: string;
    excerpt: string;
    visibility: string;
    author: { id: string; username: string; displayName: string; email: string } | null;
  };
}

export interface AdminSource {
  key: string;
  name: string;
  kind: 'NEWS' | 'EVENT' | 'TRENDING';
  section: string;
  url: string;
  enabled: boolean;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  responseTimeMs: number | null;
  consecutiveFailures: number;
  lastError: string | null;
  nextRetryAt: string | null;
  itemCount: number;
  healthy: boolean;
}

export interface AdminHealth {
  api: { status: string; environment: string; uptimeSeconds: number };
  database: { status: string; latencyMs: number | null };
  worker: { status: string; lastSeenSecondsAgo: number | null; workerId: string | null };
  moderation: { configured: boolean; provider: string };
  youtube: { configured: boolean };
  email: { transport: string; smtpConfigured: boolean };
  linkPreview: { configured: boolean };
}

export interface AdminJobs {
  queues: Array<{ name: string; state: string; count: number }>;
  recentFailures: Array<{ queue: string; id: string; createdAt: string; data: unknown }>;
}

export interface AuditEntry {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
}
