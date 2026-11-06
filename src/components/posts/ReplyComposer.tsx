import { useEffect, useState } from 'react';
import type { RichTextDoc } from '@/lib/api/types';
import { docLength, emptyDoc, prepareDoc } from '@/lib/richText';
import { clearDraft, draftKeys, readDraft, writeDraft } from '@/lib/storage';
import { errorMessage } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useCreateReply } from '@/features/posts/queries';
import { useToast } from '@/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/feedback';
import { RichTextEditor } from './RichTextEditor';

interface ReplyComposerProps {
  postId: string;
  parentId?: string | null;
  onDone?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export function ReplyComposer({
  postId,
  parentId = null,
  onDone,
  onCancel,
  autoFocus,
  compact,
}: ReplyComposerProps) {
  const { user, me, isAuthenticated } = useAuth();
  const [doc, setDoc] = useState<RichTextDoc>(emptyDoc);
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const createReply = useCreateReply(postId);
  const toast = useToast();

  const draftKey = `${draftKeys.reply(postId)}.${parentId ?? 'root'}`;

  useEffect(() => {
    const draft = readDraft(draftKey);
    if (draft && docLength(draft.content) > 0) {
      setDoc(draft.content);
      setEditorKey((current) => current + 1);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (docLength(doc) === 0) return;
    const timer = window.setTimeout(() => {
      writeDraft(draftKey, { title: '', content: doc, updatedAt: new Date().toISOString() });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [doc, draftKey, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <p className="text-[12.5px] text-muted">
        <a href="/login" className="text-accent underline underline-offset-2">
          Sign in
        </a>{' '}
        to join the conversation.
      </p>
    );
  }

  if (me?.ban.banned) {
    return (
      <p className="text-[12.5px] text-muted">
        Your account is banned, so replies are disabled. You can still read Buzz.
      </p>
    );
  }

  const submit = () => {
    const prepared = prepareDoc(doc);
    if (!prepared.ok || !prepared.doc) {
      setError(prepared.error ?? 'The reply is not valid.');
      return;
    }

    setError(null);
    createReply.mutate(
      { content: prepared.doc, parentId },
      {
        onSuccess: () => {
          clearDraft(draftKey);
          setDoc(emptyDoc());
          setEditorKey((current) => current + 1);
          toast.push({ title: 'Reply posted', tone: 'success' });
          onDone?.();
        },
        onError: (mutationError) => setError(errorMessage(mutationError)),
      },
    );
  };

  return (
    <div className={compact ? 'rounded-lg border border-line bg-surface p-3' : ''}>
      <div className="flex items-start gap-2.5">
        <Avatar src={user?.avatarUrl} name={user?.displayName ?? 'You'} size="sm" ring />
        <div className="min-w-0 flex-1">
          <div className="[&_.tiptap]:min-h-[64px]">
            <RichTextEditor
              initialContent={doc}
              onChange={setDoc}
              ariaLabel={parentId ? 'Write a reply to a comment' : 'Write a reply'}
              placeholder={parentId ? 'Reply to this comment…' : 'Add to the discussion…'}
              resetKey={editorKey}
              autoFocus={autoFocus}
            />
          </div>

          {error ? (
            <div className="mt-2">
              <InlineError>{error}</InlineError>
            </div>
          ) : null}

          <div className="mt-2 flex items-center justify-end gap-2">
            {onCancel ? (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="sm"
              onClick={submit}
              loading={createReply.isPending}
              disabled={docLength(doc) === 0}
            >
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
