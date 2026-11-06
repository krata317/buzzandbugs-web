import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, ShieldAlert, Sparkles } from 'lucide-react';
import type { RichTextDoc } from '@/lib/api/types';
import { docLength, emptyDoc, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH, prepareDoc } from '@/lib/richText';
import { validateTitle } from '@/lib/validation';
import { clearDraft, draftKeys, readDraft, writeDraft } from '@/lib/storage';
import { errorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useCreatePost } from '@/features/posts/queries';
import { useToast } from '@/providers/ToastProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button, buttonStyles } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/feedback';
import { RichTextEditor } from './RichTextEditor';

export function PostComposer({ onPublished }: { onPublished?: (id: string) => void }) {
  const { user, me, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [doc, setDoc] = useState<RichTextDoc>(emptyDoc);
  const [error, setError] = useState<string | null>(null);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const createPost = useCreatePost();
  const toast = useToast();

  const draftKey = draftKeys.newPost;

  useEffect(() => {
    const draft = readDraft(draftKey);
    if (draft && (draft.title.trim() || docLength(draft.content) > 0)) {
      setTitle(draft.title);
      setDoc(draft.content);
      setEditorKey((current) => current + 1);
      setRestoredAt(draft.updatedAt);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!title.trim() && docLength(doc) === 0) return;

    const timer = window.setTimeout(() => {
      writeDraft(draftKey, {
        title,
        content: doc,
        updatedAt: new Date().toISOString(),
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [title, doc, draftKey, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
            <PenLine size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[13.5px] font-medium text-ink">Have something to share?</p>
            <p className="text-[12.5px] text-muted">Sign in to post, reply and vote.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            Sign in
          </Link>
          <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
            Join
          </Link>
        </div>
      </div>
    );
  }

  if (me?.ban.banned) {
    return (
      <div className="card flex items-start gap-3 border-danger/25 bg-danger/5 p-4">
        <ShieldAlert size={17} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
        <div>
          <p className="text-[13.5px] font-medium text-ink">
            {me.ban.permanent ? 'Your account is permanently banned' : 'Your account is banned'}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            {me.ban.permanent
              ? 'You can still read Buzz and delete your own posts.'
              : `You can post again after ${me.ban.until ? formatDateTime(me.ban.until) : 'the ban ends'}. You can still read and delete your posts.`}
          </p>
        </div>
      </div>
    );
  }

  const length = docLength(doc);

  const publish = () => {
    const titleError = validateTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }

    const prepared = prepareDoc(doc);
    if (!prepared.ok || !prepared.doc) {
      setError(prepared.error ?? 'The post body is not valid.');
      return;
    }

    setError(null);
    createPost.mutate(
      { title: title.trim(), content: prepared.doc },
      {
        onSuccess: (created) => {
          clearDraft(draftKey);
          setTitle('');
          setDoc(emptyDoc());
          setRestoredAt(null);
          setEditorKey((current) => current + 1);
          toast.push({ title: 'Post published', tone: 'success' });
          onPublished?.(created.id);
        },
        onError: (mutationError) => setError(errorMessage(mutationError)),
      },
    );
  };

  return (
    <section className="card p-4 sm:p-5" aria-label="Write a post">
      <div className="flex items-center gap-2.5">
        <Avatar src={user?.avatarUrl} name={user?.displayName ?? 'You'} size="sm" ring />
        <p className="text-[13px] text-muted">
          Posting as <span className="font-medium text-ink">{user?.displayName}</span>
        </p>
        {restoredAt ? (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-1 text-[10.5px] font-medium text-accent">
            <Sparkles size={11} aria-hidden="true" />
            Draft restored
            <button
              type="button"
              onClick={() => {
                clearDraft(draftKey);
                setTitle('');
                setDoc(emptyDoc());
                setRestoredAt(null);
                setEditorKey((current) => current + 1);
              }}
              className="focus-ring ml-1 underline decoration-current/40 underline-offset-2 hover:decoration-current"
            >
              Discard
            </button>
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <label htmlFor="composer-title" className="sr-only">
          Post title
        </label>
        <input
          id="composer-title"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(event) => {
            setTitle(event.target.value);
            setError(null);
          }}
          placeholder="A clear title helps people find this"
          className="w-full border-0 bg-transparent px-0 py-1 text-[17px] font-semibold tracking-[-0.01em] text-ink outline-none placeholder:font-normal placeholder:text-subtle"
        />
        <div className="mt-2">
          <RichTextEditor
            initialContent={doc}
            onChange={setDoc}
            ariaLabel="Post body"
            resetKey={editorKey}
          />
        </div>
      </div>

      {error ? (
        <div className="mt-3">
          <InlineError>{error}</InlineError>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
          {length.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()} characters
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={publish}
            loading={createPost.isPending}
            disabled={length === 0}
          >
            Publish
          </Button>
        </div>
      </div>
    </section>
  );
}
