import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Ban,
  CalendarDays,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Lock,
  MoreHorizontal,
  PencilLine,
  ShieldAlert,
  Twitter,
  UserX,
  Youtube,
} from 'lucide-react';
import type { SocialKey } from '@/lib/api/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useBlock, useBlockedUsers, useFollowers, useFollowing, useProfile, useUserPosts } from '@/features/users/queries';
import { useAuth } from '@/providers/AuthProvider';
import { errorMessage, isApiError, isNetworkError } from '@/lib/api';
import { formatCount, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Menu, Modal } from '@/components/ui/overlay';
import { EmptyState, ErrorState, FeedSkeleton, Skeleton } from '@/components/ui/feedback';
import { FollowButton } from '@/components/users/FollowButton';
import { UserRow } from '@/components/users/UserRow';
import { PostCard } from '@/components/posts/PostCard';
import { LoadMore, PageHeader } from '@/components/ui/nav';
import { useToast } from '@/providers/ToastProvider';

const SOCIAL_ICON: Record<SocialKey, typeof Globe> = {
  instagram: Instagram,
  x: Twitter,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
  website: Globe,
};

const SOCIAL_LABEL: Record<SocialKey, string> = {
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  youtube: 'YouTube',
  website: 'Website',
};

export function ProfilePage() {
  const { username = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'posts';
  const profile = useProfile(username);
  const { isAuthenticated } = useAuth();
  const block = useBlock();
  const blocked = useBlockedUsers(isAuthenticated);
  const navigate = useNavigate();
  const toast = useToast();
  const [blockOpen, setBlockOpen] = useState(false);

  useDocumentTitle(profile.data?.displayName ?? `@${username}`);

  if (username.toLowerCase() === 'deleted') {
    return <DeletedProfile />;
  }

  if (profile.isLoading) {
    return (
      <div className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
        <FeedSkeleton count={2} />
      </div>
    );
  }

  if (profile.isError) {
    const notFound = isApiError(profile.error) && profile.error.status === 404;
    const offline = isNetworkError(profile.error);
    return (
      <ErrorState
        title={notFound ? 'Profile not found' : offline ? 'Profile could not load' : 'Something went wrong'}
        description={
          notFound
            ? 'This account does not exist, or a block prevents you from seeing it.'
            : offline
              ? 'The API is not reachable. Start the backend and try again.'
              : errorMessage(profile.error)
        }
        onRetry={notFound ? undefined : () => void profile.refetch()}
        offline={offline}
      />
    );
  }

  const data = profile.data;
  if (!data) return null;

  const isSelf = data.viewer.isSelf;
  const isBlockedByMe = blocked.data?.some((entry) => entry.username === data.username) ?? false;
  const socialEntries = Object.entries(data.socialLinks) as Array<[SocialKey, string]>;
  const hiddenStats = data.stats.followers === null || data.stats.following === null;

  const tabs = [
    { value: 'posts', label: 'Posts' },
    { value: 'followers', label: 'Followers' },
    { value: 'following', label: 'Following' },
  ] as const;

  const selectTab = (next: string) => {
    const search = new URLSearchParams(params);
    if (next === 'posts') search.delete('tab');
    else search.set('tab', next);
    setParams(search, { replace: true });
  };

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar src={data.avatarUrl} name={data.displayName} size="xl" ring />
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink">
                {data.displayName}
              </h1>
              <p className="mt-0.5 font-mono text-[12px] text-subtle">@{data.username}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {data.viewer.followsYou && !isSelf ? (
                  <span className="rounded-full bg-raised px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
                    Follows you
                  </span>
                ) : null}
                {data.ban?.banned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-danger">
                    <ShieldAlert size={10} aria-hidden="true" />
                    {data.ban.permanent ? 'Permanently banned' : 'Banned'}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSelf ? (
              <Link
                to="/settings/profile"
                className={buttonStyles({ variant: 'secondary', size: 'sm' })}
              >
                <PencilLine size={13} aria-hidden="true" />
                Edit profile
              </Link>
            ) : (
              <FollowButton
                username={data.username}
                isFollowing={data.viewer.isFollowing}
                size="sm"
              />
            )}

            {!isSelf && isAuthenticated ? (
              <Menu
                trigger={<MoreHorizontal size={16} />}
                triggerLabel="Profile actions"
                items={[
                  {
                    label: isBlockedByMe ? 'Unblock this account' : 'Block this account',
                    icon: <Ban size={13} />,
                    tone: isBlockedByMe ? 'default' : 'danger',
                    onSelect: () => setBlockOpen(true),
                  },
                ]}
              />
            ) : null}
          </div>
        </div>

        {data.about ? (
          <p className="mt-4 max-w-2xl whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
            {data.about}
          </p>
        ) : null}

        {socialEntries.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {socialEntries.map(([key, href]) => {
              const Icon = SOCIAL_ICON[key] ?? Globe;
              return (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener me"
                    className="focus-ring inline-flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-accent"
                  >
                    <Icon size={13} aria-hidden="true" />
                    {SOCIAL_LABEL[key] ?? key}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
            <strong className="font-medium text-ink">{formatCount(data.stats.posts)}</strong> posts
          </span>
          {data.stats.followers !== null ? (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
              <strong className="font-medium text-ink">{formatCount(data.stats.followers)}</strong>{' '}
              followers
            </span>
          ) : null}
          {data.stats.following !== null ? (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
              <strong className="font-medium text-ink">{formatCount(data.stats.following)}</strong>{' '}
              following
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
            <CalendarDays size={11} aria-hidden="true" />
            Joined {formatDate(data.createdAt)}
          </span>
        </div>

        {hiddenStats ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-subtle">
            <Lock size={11} aria-hidden="true" />
            Some profile details are private.
          </p>
        ) : null}
      </section>

      <div className="border-b border-line">
        <nav aria-label="Profile sections" className="-mb-px flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => selectTab(item.value)}
              aria-current={tab === item.value ? 'page' : undefined}
              className={cn(
                'focus-ring whitespace-nowrap border-b-2 px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                tab === item.value
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:border-lineStrong hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'posts' ? <ProfilePosts username={data.username} /> : null}
      {tab === 'followers' ? <ProfileDirectory username={data.username} kind="followers" /> : null}
      {tab === 'following' ? <ProfileDirectory username={data.username} kind="following" /> : null}

      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={isBlockedByMe ? 'Unblock this account?' : 'Block this account?'}
        description={
          isBlockedByMe
            ? 'You will be able to see their posts and profile again.'
            : 'Blocking removes follows in both directions and hides your content from each other.'
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isBlockedByMe ? 'primary' : 'danger'}
              loading={block.isPending}
              onClick={() =>
                block.mutate(
                  { username: data.username, block: !isBlockedByMe },
                  {
                    onSuccess: () => {
                      setBlockOpen(false);
                      toast.push({
                        title: isBlockedByMe ? 'Account unblocked' : 'Account blocked',
                        tone: 'success',
                      });
                      if (!isBlockedByMe) navigate('/buzz');
                      else void profile.refetch();
                    },
                    onError: (error) =>
                      toast.push({
                        title: 'Could not update the block',
                        description: errorMessage(error),
                        tone: 'error',
                      }),
                  },
                )
              }
            >
              {isBlockedByMe ? 'Unblock' : 'Block'}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-muted">
          {data.displayName} <span className="font-mono text-[11.5px]">@{data.username}</span>
        </p>
      </Modal>
    </div>
  );
}

function ProfilePosts({ username }: { username: string }) {
  const posts = useUserPosts(username);
  const items = posts.data?.pages.flatMap((page) => page.items) ?? [];

  if (posts.isLoading) return <FeedSkeleton count={3} />;

  if (posts.isError) {
    return (
      <ErrorState
        title="Posts could not load"
        description={errorMessage(posts.error)}
        onRetry={() => void posts.refetch()}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Posts this account publishes will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {posts.hasNextPage ? (
        <LoadMore
          onClick={() => void posts.fetchNextPage()}
          loading={posts.isFetchingNextPage}
          label="Load older posts"
        />
      ) : null}
    </div>
  );
}

function ProfileDirectory({
  username,
  kind,
}: {
  username: string;
  kind: 'followers' | 'following';
}) {
  const followers = useFollowers(kind === 'followers' ? username : undefined);
  const following = useFollowing(kind === 'following' ? username : undefined);
  const query = kind === 'followers' ? followers : following;
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title={`${kind === 'followers' ? 'Followers' : 'Following'} could not load`}
        description={errorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<UserX size={20} />}
        title={kind === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
      />
    );
  }

  return (
    <div>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface px-2">
        {items.map((entry) => (
          <UserRow key={`${entry.id ?? entry.username}`} user={entry} />
        ))}
      </ul>
      {query.hasNextPage ? (
        <div className="pt-3">
          <LoadMore
            onClick={() => void query.fetchNextPage()}
            loading={query.isFetchingNextPage}
          />
        </div>
      ) : null}
    </div>
  );
}

function DeletedProfile() {
  return (
    <div className="space-y-5">
      <PageHeader title="Squashed Bug" eyebrow="Deleted account" />
      <div className={cn('card flex flex-col items-center px-6 py-14 text-center')}>
        <Avatar name="Squashed Bug" size="lg" />
        <p className="mt-4 text-[14.5px] font-medium text-ink">This account was deleted</p>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
          Posts written by this account stay visible, but the author is anonymised and no profile
          information remains.
        </p>
        <Link to="/buzz" className={cn(buttonStyles({ variant: 'secondary', size: 'sm' }), 'mt-5')}>
          Back to Buzz
        </Link>
      </div>
    </div>
  );
}
