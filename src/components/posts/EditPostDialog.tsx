import { useEffect, useState } from 'react';
import type { PostDetail, RichTextDoc } from '@/lib/api/types';
import { docLength, prepareDoc } from '@/lib/richText';
import { validateTitle } from '@/lib/validation';
import { errorMessage } from '@/lib/api';
import { useUpdatePost } from '@/features/posts/queries';
import { useToast } from '@/providers/ToastProvider';
import { Modal } from '@/components/ui/overlay';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { InlineError } from '@/components/ui/feedback';
import { MAX_TITLE_LENGTH } from '@/lib/richText';
import { RichTextEditor } from './RichTextEditor';

interface EditPostDialogProps {
  post: PostDetail;
  open: boolean;
  onClose: () => void;
}

export function EditPostDialog({ post, open, onClose }: EditPostDialogProps) {
  const [title, setTitle] = useState(post.title);
  const [doc, setDoc] = useState<RichTextDoc>({ type: 'doc', content: post.content?.content ?? [] });
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const updatePost = useUpdatePost(post.id);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setTitle(post.title);
    setDoc({ type: 'doc', content: post.content?.content ?? [] });
    setError(null);
    setEditorKey((current) => current + 1);
  }, [open, post.id, post.title, post.content]);

  const save = () => {
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
    updatePost.mutate(
      { title: title.trim(), content: prepared.doc },
      {
        onSuccess: () => {
          toast.push({ title: 'Post updated', tone: 'success' });
          onClose();
        },
        onError: (mutationError) => setError(errorMessage(mutationError)),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit post"
      description="Edits are checked before they become visible, so a check must be available."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={updatePost.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="Title"
          htmlFor="edit-title"
          hint={`${title.length}/${MAX_TITLE_LENGTH}`}
        >
          <Input
            id="edit-title"
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>

        <div>
          <span className="label">Body</span>
          <RichTextEditor
            initialContent={doc}
            onChange={setDoc}
            ariaLabel="Post body"
            resetKey={editorKey}
          />
          <p className="hint">{docLength(doc).toLocaleString()} characters</p>
        </div>

        {error ? <InlineError>{error}</InlineError> : null}
      </div>
    </Modal>
  );
}
