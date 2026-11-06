import { useNavigate } from 'react-router-dom';
import { Inbox, RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useFeed } from '@/features/posts/queries';
import { PostComposer } from '@/components/posts/PostComposer';
import { PostCard } from '@/components/posts/PostCard';
import { PageHeader, LoadMore } from '@/components/ui/nav';
import { EmptyState, ErrorState, FeedSkeleton, InlineError } from '@/components/ui/feedback';
import { IconButton } from '@/components/ui/Button';
import { isNetworkError } from '@/lib/api';

export function BuzzPage() {
  useDocumentTitle('Buzz');
  const feed = useFeed();
  const navigate = useNavigate();

  const posts = feed.data?.pages.flatMap((page) => page.items) ?? [];
  const isOffline = feed.isError && isNetworkError(feed.error);

  return (
    <div className="space-y-5">
      <PageHeader
        serif
        eyebrow="Community"
        title="Buzz"
        description="Discussions, questions and things worth sharing — newest first, in the order they were published."
        actions={
          <IconButton
            label="Refresh feed"
            variant="secondary"
            onClick={() => void feed.refetch()}
            disabled={feed.isFetching}
          >
            <RefreshCw size={14} className={feed.isFetching ? 'animate-spin' : undefined} />
          </IconButton>
        }
      />

      <PostComposer onPublished={(id) => navigate(`/posts/${id}`)} />

      {feed.isLoading ? <FeedSkeleton count={4} /> : null}

      {feed.isError && !feed.data ? (
        <ErrorState
          title={isOffline ? 'Buzz could not load' : 'Something went wrong'}
          description={
            isOffline
              ? 'Check your connection and try again. Your draft is kept on this device.'
              : 'The feed request failed. Retrying usually fixes it.'
          }
          onRetry={() => void feed.refetch()}
          offline={isOffline}
        />
      ) : null}

      {feed.data && posts.length === 0 ? (
        <EmptyState
          icon={<Inbox size={22} />}
          title="No posts yet"
          description="Buzz is quiet. Publish the first post — it will appear here immediately."
        />
      ) : null}

      {posts.length > 0 ? (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {feed.hasNextPage ? (
            <LoadMore
              onClick={() => void feed.fetchNextPage()}
              loading={feed.isFetchingNextPage}
              label="Load older posts"
            />
          ) : (
            <p className="pt-1 text-center font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">
              End of the feed
            </p>
          )}
        </>
      ) : null}

      {feed.isFetchNextPageError ? (
        <InlineError>Older posts could not be loaded. Try again.</InlineError>
      ) : null}
    </div>
  );
}
