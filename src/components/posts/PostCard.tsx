import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Flag,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Repeat2,
  Trash2,
} from 'lucide-react';
import type { PostSummary } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { formatCount, formatDateTime, relativeTime } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useDeletePost } from '@/features/posts/queries';
import { errorMessage } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';
import { Menu, Modal } from '@/components/ui/overlay';
import { VoteControl } from './VoteControl';
import { ShareButton } from './ShareButton';
import { RepostQuote } from './RepostQuote';
import { ReportDialog } from './ReportDialog';
import { RepostDialog } from './RepostDialog';

interface PostCardProps {
  post: PostSummary;
  /** Renders the card without the outer border, for use inside a detail page. */
  flush?: boolean;
  onDeleted?: () => void;
}

export function PostCard({ post, flush, onDeleted }: PostCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deletePost = useDeletePost();
  const toast = useToast();
  const navigate = useNavigate();

  const isOwner = Boolean(user && post.author.id === user.id);
  const authorHref = post.author.username ? `/users/${post.author.username}` : '/users/deleted';

  const copyLink = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.push({ title: 'Link copied', tone: 'success' });
    } catch {
      toast.push({ title: 'Could not copy the link', tone: 'error' });
    }
  };

  const menuItems = [
    ...(isOwner
      ? [
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
    {
      label: 'Copy link',
      icon: <Link2 size={13} />,
      onSelect: () => void copyLink(),
    },
  ];

  return (
    <article
      className={cn(
        'group relative transition-[border-color,box-shadow] duration-200',
        flush ? 'py-5' : 'card-interactive p-4 sm:p-5',
      )}
    >
      <header className="flex items-start gap-2.5">
        <Link to={authorHref} className="focus-ring shrink-0 rounded-full" tabIndex={-1}>
          <Avatar src={post.author.avatarUrl} name={post.author.displayName} size="md" ring />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Link
              to={authorHref}
              className="focus-ring truncate text-[13.5px] font-medium text-ink transition-colors hover:text-accent"
            >
              {post.author.displayName}
            </Link>
            {post.author.username ? (
              <span className="truncate font-mono text-[11px] text-subtle">
                @{post.author.username}
              </span>
            ) : null}
            {post.kind === 'REPOST' ? <Badge tone="accent">Repost</Badge> : null}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-subtle">
            <time dateTime={post.createdAt} title={formatDateTime(post.createdAt)}>
              {relativeTime(post.createdAt)}
            </time>
            {post.isEdited ? <span>· edited</span> : null}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <Menu
            trigger={<MoreHorizontal size={16} />}
            triggerLabel="Post actions"
            items={menuItems}
          />
        </div>
      </header>

      <div className="mt-3">
        <Link to={`/posts/${post.id}`} className="focus-ring group/title block rounded-sm">
          <h2 className="break-words text-[16.5px] font-semibold leading-snug tracking-[-0.012em] text-ink transition-colors group-hover/title:text-accent">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-1.5 line-clamp-3 break-words text-[13.5px] leading-relaxed text-muted">
              {post.excerpt}
            </p>
          ) : null}
        </Link>

        {post.repostOf ? <RepostQuote target={post.repostOf} /> : null}
      </div>

      <footer className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <VoteControl postId={post.id} score={post.score} viewerVote={post.viewerVote} />

        <Link
          to={`/posts/${post.id}#replies`}
          className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
          aria-label={`${post.replyCount} replies`}
        >
          <MessageSquare size={14} aria-hidden="true" />
          {formatCount(post.replyCount)}
        </Link>

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            setRepostOpen(true);
          }}
          className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
          aria-label="Repost"
        >
          <Repeat2 size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Repost</span>
        </button>

        <ShareButton postId={post.id} title={post.title} />

        <button
          type="button"
          onClick={() => void copyLink()}
          className="focus-ring ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-subtle opacity-0 transition-opacity hover:bg-raised hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 sm:inline-flex"
          aria-label="Copy post link"
        >
          <Copy size={13} aria-hidden="true" />
        </button>
      </footer>

      {reportOpen ? (
        <ReportDialog postId={post.id} open={reportOpen} onClose={() => setReportOpen(false)} />
      ) : null}

      {repostOpen ? (
        <RepostDialog post={post} open={repostOpen} onClose={() => setRepostOpen(false)} />
      ) : null}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this post?"
        description="The post and its content are removed. Replies stay but the post is no longer readable."
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
                deletePost.mutate(post.id, {
                  onSuccess: () => {
                    setDeleteOpen(false);
                    toast.push({ title: 'Post deleted', tone: 'success' });
                    onDeleted?.();
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
        <p className="text-[13px] leading-relaxed text-muted">
          <span className="font-medium text-ink">{post.title}</span>
        </p>
      </Modal>
    </article>
  );
}
