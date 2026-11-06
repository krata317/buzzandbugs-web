import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat2 } from 'lucide-react';
import type { PostSummary } from '@/lib/api/types';
import { useCreatePost } from '@/features/posts/queries';
import { docFromText, MAX_TITLE_LENGTH } from '@/lib/richText';
import { validateTitle } from '@/lib/validation';
import { errorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/overlay';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';
import { useToast } from '@/providers/ToastProvider';

interface RepostDialogProps {
  post: PostSummary;
  open: boolean;
  onClose: () => void;
}

export function RepostDialog({ post, open, onClose }: RepostDialogProps) {
  const [title, setTitle] = useState(post.title);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createPost = useCreatePost();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setNote('');
      setError(null);
    }
  }, [open, post.title]);

  const submit = () => {
    const titleError = validateTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }
    setError(null);

    const trimmedNote = note.trim();
    createPost.mutate(
      {
        title: title.trim(),
        repostOfId: post.repostOf?.id ?? post.id,
        content: trimmedNote ? docFromText(trimmedNote) : undefined,
      },
      {
        onSuccess: (created) => {
          toast.push({ title: 'Reposted', tone: 'success' });
          onClose();
          navigate(`/posts/${created.id}`);
        },
        onError: (mutationError) => setError(errorMessage(mutationError)),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Repost to your followers"
      description="The original author is credited and linked."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={createPost.isPending}
            iconLeft={<Repeat2 size={14} />}
          >
            Repost
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-raised/50 px-3.5 py-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">
            Original post
          </p>
          <p className="mt-1 line-clamp-2 text-[13.5px] font-medium text-ink">{post.title}</p>
          <p className="mt-0.5 text-[12px] text-muted">
            {post.author.displayName}
            {post.author.username ? ` · @${post.author.username}` : ''}
          </p>
        </div>

        <Field label="Title" htmlFor="repost-title" hint={`${title.length}/${MAX_TITLE_LENGTH}`}>
          <Input
            id="repost-title"
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            invalid={Boolean(error)}
          />
        </Field>

        <Field
          label="Add a note"
          htmlFor="repost-note"
          optional
          hint="Plain text. Formatting is not available on repost notes."
        >
          <Textarea
            id="repost-note"
            value={note}
            rows={3}
            maxLength={2000}
            placeholder="Why is this worth reading?"
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>

        {error ? <InlineError>{error}</InlineError> : null}
      </div>
    </Modal>
  );
}
