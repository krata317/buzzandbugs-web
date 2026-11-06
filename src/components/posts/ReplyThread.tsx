import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CornerDownRight, Trash2 } from 'lucide-react';
import type { Reply } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { formatDateTime, relativeTime } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useDeleteReply } from '@/features/posts/queries';
import { errorMessage } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/overlay';
import { Button } from '@/components/ui/Button';
import { RichText } from './RichText';
import { ReplyComposer } from './ReplyComposer';

interface ReplyNode extends Reply {
  children: ReplyNode[];
}

function buildTree(replies: Reply[]): ReplyNode[] {
  const nodes = new Map<string, ReplyNode>();
  for (const reply of replies) nodes.set(reply.id, { ...reply, children: [] });

  const roots: ReplyNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return roots;
}

function ReplyItem({
  node,
  postId,
  depth,
}: {
  node: ReplyNode;
  postId: string;
  depth: number;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteReply = useDeleteReply(postId);
  const toast = useToast();

  const isOwner = Boolean(user && node.author.id === user.id);
  const authorHref = node.author.username ? `/users/${node.author.username}` : '/users/deleted';
  const cappedDepth = Math.min(depth, 3);

  return (
    <li className={cn(cappedDepth > 0 && 'border-l border-line pl-3 sm:pl-4')}>
      <article className="py-3">
        <header className="flex items-center gap-2">
          <Link to={authorHref} className="focus-ring shrink-0 rounded-full" tabIndex={-1}>
            <Avatar src={node.author.avatarUrl} name={node.author.displayName} size="xs" />
          </Link>
          <Link
            to={authorHref}
            className="focus-ring truncate text-[12.5px] font-medium text-ink hover:text-accent"
          >
            {node.author.displayName}
          </Link>
          {node.author.username ? (
            <span className="truncate font-mono text-[10.5px] text-subtle">
              @{node.author.username}
            </span>
          ) : null}
          <span className="text-subtle" aria-hidden="true">
            ·
          </span>
          <time
            dateTime={node.createdAt}
            title={formatDateTime(node.createdAt)}
            className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.06em] text-subtle"
          >
            {relativeTime(node.createdAt)}
          </time>
        </header>

        <div className="mt-1.5 pl-8">
          {node.deleted ? (
            <p className="text-[13px] italic text-subtle">This reply was deleted.</p>
          ) : (
            <RichText doc={node.content} className="post-body text-[13.5px] leading-relaxed" />
          )}

          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setReplying((current) => !current)}
              className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[12px] text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <CornerDownRight size={12} aria-hidden="true" />
              Reply
            </button>
            {isOwner ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[12px] text-muted transition-colors hover:bg-raised hover:text-danger"
              >
                <Trash2 size={12} aria-hidden="true" />
                Delete
              </button>
            ) : null}
          </div>

          {replying ? (
            <div className="mt-2">
              <ReplyComposer
                postId={postId}
                parentId={node.id}
                autoFocus
                compact
                onCancel={() => setReplying(false)}
                onDone={() => setReplying(false)}
              />
            </div>
          ) : null}
        </div>
      </article>

      {node.children.length > 0 ? (
        <ul className="ml-8">
          {node.children.map((child) => (
            <ReplyItem key={child.id} node={child} postId={postId} depth={depth + 1} />
          ))}
        </ul>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this reply?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep reply
            </Button>
            <Button
              variant="danger"
              loading={deleteReply.isPending}
              onClick={() =>
                deleteReply.mutate(node.id, {
                  onSuccess: () => {
                    setConfirmOpen(false);
                    toast.push({ title: 'Reply deleted', tone: 'success' });
                  },
                  onError: (error) =>
                    toast.push({
                      title: 'Could not delete the reply',
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
        <p className="text-[13px] text-muted">
          Deleting a reply frees one of your ten reply slots on this post.
        </p>
      </Modal>
    </li>
  );
}

export function ReplyThread({ postId, replies }: { postId: string; replies: Reply[] }) {
  const tree = useMemo(() => buildTree(replies), [replies]);

  if (tree.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-muted">
        No replies yet. Start the discussion.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {tree.map((node) => (
        <ReplyItem key={node.id} node={node} postId={postId} depth={0} />
      ))}
    </ul>
  );
}
