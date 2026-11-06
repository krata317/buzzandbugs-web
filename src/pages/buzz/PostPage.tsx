import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Flag,
  MessageSquare,
  MoreHorizontal,
  PencilLine,
  Repeat2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDeletePost, usePost, useReplies } from '@/features/posts/queries';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { errorMessage, isApiError, isNetworkError } from '@/lib/api';
import { formatDateTime, relativeTime } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, EmptyState, ErrorState, LoadingBlock } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';
import { Menu, Modal } from '@/components/ui/overlay';
import { RichText } from '@/components/posts/RichText';
import { RepostQuote } from '@/components/posts/RepostQuote';
import { VoteControl } from '@/components/posts/VoteControl';
import { ShareButton } from '@/components/posts/ShareButton';
import { ReplyComposer } from '@/components/posts/ReplyComposer';
import { ReplyThread } from '@/components/posts/ReplyThread';
import { ReportDialog } from '@/components/posts/ReportDialog';
import { RepostDialog } from '@/components/posts/RepostDialog';
import { EditPostDialog } from '@/components/posts/EditPostDialog';
import type { PostSummary } from '@/lib/api/types';

const MODERATION_COPY: Record<string, string> = {
  AWAITING_APPEAL: 'This post was flagged and is hidden from everyone else while you appeal.',
  APPEALED: 'Your appeal is queued for a moderator to review.',
};

export function PostPage() {
  const { id = '' } = useParams();
  const post = usePost(id);
  const replies = useReplies(id);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const deletePost = useDeletePost();

  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useDocumentTitle(post.data?.title ?? 'Post');

  if (post.isLoading) return <LoadingBlock label="Loading post" />;

  if (post.isError) {
    const notFound = isApiError(post.error) && post.error.status === 404;
    const offline = isNetworkError(post.error);
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState
          title={notFound ? 'Post not found' : offline ? 'The post could not load' : 'Something went wrong'}
          description={
            notFound
              ? 'It may have been deleted, removed by moderation, or hidden from you.'
              : offline
                ? 'Check your connection and try again.'
                : 'The request failed. Retrying usually fixes it.'
          }
          onRetry={notFound ? undefined : () => void post.refetch()}
          offline={offline}
        />
      </div>
    );
  }

  const data = post.data;
  if (!data) return null;

  const isOwner = Boolean(user && data.author.id === user.id);
  const authorHref = data.author.username ? `/users/${data.author.username}` : '/users/deleted';
  const replyList = replies.data ?? [];
  const moderationCopy = data.moderation ? MODERATION_COPY[data.moderation.status] : null;

  const asSummary: PostSummary = {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt,
    kind: data.kind,
    score: data.score,
    replyCount: data.replyCount,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isEdited: data.isEdited,
    url: data.url,
    author: data.author,
    viewerVote: data.viewerVote,
    repostOf: data.repostOf,
  };

  return (
    <div className="space-y-6">
      <BackLink />

      <article className="card p-5 sm:p-6">
        <header className="flex items-start gap-3">
          <Link to={authorHref} className="focus-ring shrink-0 rounded-full" tabIndex={-1}>
            <Avatar src={data.author.avatarUrl} name={data.author.displayName} size="md" ring />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                to={authorHref}
                className="focus-ring truncate text-[13.5px] font-medium text-ink hover:text-accent"
              >
                {data.author.displayName}
              </Link>
              {data.author.username ? (
                <span className="truncate font-mono text-[11px] text-subtle">
                  @{data.author.username}
                </span>
              ) : null}
              {data.kind === 'REPOST' ? <Badge tone="accent">Repost</Badge> : null}
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-subtle">
              <time dateTime={data.createdAt}>{formatDateTime(data.createdAt)}</time>
              {data.isEdited ? <span>· edited {relativeTime(data.updatedAt)}</span> : null}
            </p>
          </div>

          <Menu
            trigger={<MoreHorizontal size={17} />}
            triggerLabel="Post actions"
            items={[
              ...(isOwner
                ? [
                    {
                      label: 'Edit post',
                      icon: <PencilLine size={13} />,
                      onSelect: () => setEditOpen(true),
                    },
                    {
                      label: 'Delete post',
                      icon: <Trash2 size={13} />,
                      tone: 'danger' as const,
                      onSelect: () => setDeleteOpen(true),
                    },
                  ]
                : []),
              ...(isAuthenticated && !isOwner
                ? [
                    {
                      label: 'Report post',
                      icon: <Flag size={13} />,
                      onSelect: () => setReportOpen(true),
                    },
                  ]
                : []),
            ]}
          />
        </header>

        {moderationCopy ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-amber-800 dark:text-amber-200">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p>{moderationCopy}</p>
              {data.moderation?.appealDeadline ? (
                <p className="mt-1 text-[11.5px] opacity-80">
                  Appeal window closes {formatDateTime(data.moderation.appealDeadline)}. The link is
                  in the email and notification you received.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <h1 className="mt-4 break-words text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[27px]">
          {data.title}
        </h1>

        {data.content ? (
          <RichText doc={data.content} className="post-body mt-3" />
        ) : (
          <p className="mt-3 text-[13px] italic text-subtle">This repost has no body of its own.</p>
        )}

        {data.repostOf ? <RepostQuote target={data.repostOf} showContent /> : null}

        <footer className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <VoteControl postId={data.id} score={data.score} viewerVote={data.viewerVote} size="md" />

          <a
            href="#replies"
            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <MessageSquare size={14} aria-hidden="true" />
            {data.replyCount} replies
          </a>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
                return;
              }
              setRepostOpen(true);
            }}
            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <Repeat2 size={14} aria-hidden="true" />
            Repost
          </button>

          <ShareButton postId={data.id} title={data.title} className="h-8 px-2.5" />
        </footer>
      </article>

      <section id="replies" className="scroll-mt-20">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Replies
            <span className="ml-2 font-mono text-[11px] font-normal text-subtle">
              {data.replyCount}
            </span>
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
            Max 10 per person
          </p>
        </div>

        <div className="mb-4">
          <ReplyComposer postId={data.id} />
        </div>

        {replies.isLoading ? <LoadingBlock label="Loading replies" /> : null}

        {replies.isError ? (
          <ErrorState
            title="Replies could not load"
            description={errorMessage(replies.error)}
            onRetry={() => void replies.refetch()}
          />
        ) : null}

        {replies.data && replyList.length === 0 ? (
          <EmptyState
            compact
            icon={<MessageSquare size={20} />}
            title="No replies yet"
            description="Be the first to respond. Replies stay threaded so conversations remain readable."
          />
        ) : null}

        {replyList.length > 0 ? <ReplyThread postId={data.id} replies={replyList} /> : null}
      </section>

      {editOpen ? (
        <EditPostDialog post={data} open={editOpen} onClose={() => setEditOpen(false)} />
      ) : null}

      {reportOpen ? (
        <ReportDialog postId={data.id} open={reportOpen} onClose={() => setReportOpen(false)} />
      ) : null}

      {repostOpen ? (
        <RepostDialog post={asSummary} open={repostOpen} onClose={() => setRepostOpen(false)} />
      ) : null}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this post?"
        description="The post and its content are removed. This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep post
            </Button>
            <Button
              variant="danger"
              loading={deletePost.isPending}
              onClick={() =>
                deletePost.mutate(data.id, {
                  onSuccess: () => {
                    toast.push({ title: 'Post deleted', tone: 'success' });
                    navigate('/buzz', { replace: true });
                  },
                  onError: (error) =>
                    toast.push({
                      title: 'Could not delete the post',
                      description: errorMessage(error),
                      tone: 'error',
                    }),
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">{data.title}</p>
      </Modal>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/buzz"
      className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={13} aria-hidden="true" />
      Back to Buzz
    </Link>
  );
}
