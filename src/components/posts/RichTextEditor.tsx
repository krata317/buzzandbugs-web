import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Link2,
  List,
  Underline as UnderlineIcon,
} from 'lucide-react';
import type { RichTextDoc } from '@/lib/api/types';
import { isHttpUrl } from '@/lib/richText';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

/**
 * Mention nodes are rendered and preserved, but not inserted from the composer: the
 * backend resolves mentions by user id and exposes no user search endpoint.
 */
const Mention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      username: { default: null },
      deleted: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-mention-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const label =
      typeof HTMLAttributes.label === 'string'
        ? HTMLAttributes.label
        : typeof HTMLAttributes.username === 'string'
          ? HTMLAttributes.username
          : 'user';

    return [
      'span',
      mergeAttributes({ 'data-mention-id': HTMLAttributes.id, class: 'mention' }),
      `@${label}`,
    ];
  },
});

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
        active ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-raised hover:text-ink',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openLink = () => {
    const current = editor.getAttributes('link').href;
    setLinkValue(typeof current === 'string' ? current : '');
    setLinkError(null);
    setLinkOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 20);
  };

  const applyLink = () => {
    const value = linkValue.trim();
    if (!value) {
      editor.chain().focus().unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!isHttpUrl(value)) {
      setLinkError('Use a full http:// or https:// URL.');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: value }).run();
    setLinkOpen(false);
  };

  return (
    <div className="border-b border-line">
      <div className="flex items-center gap-0.5 pb-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-line" />
        <ToolbarButton
          label="Bulleted list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton label="Add link" active={editor.isActive('link')} onClick={openLink}>
          <Link2 size={14} />
        </ToolbarButton>
      </div>

      {linkOpen ? (
        <div className="flex items-center gap-2 pb-2">
          <input
            ref={inputRef}
            type="url"
            value={linkValue}
            placeholder="https://example.com"
            onChange={(event) => {
              setLinkValue(event.target.value);
              setLinkError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }
              if (event.key === 'Escape') setLinkOpen(false);
            }}
            className="field h-8 flex-1 font-mono text-[12px]"
            aria-label="Link URL"
            aria-invalid={Boolean(linkError)}
          />
          <Button size="sm" variant="primary" onClick={applyLink}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setLinkOpen(false)}>
            Cancel
          </Button>
        </div>
      ) : null}

      {linkError ? <p className="pb-2 text-[11.5px] text-danger">{linkError}</p> : null}
    </div>
  );
}

interface RichTextEditorProps {
  initialContent: RichTextDoc;
  onChange: (doc: RichTextDoc) => void;
  placeholder?: string;
  ariaLabel: string;
  /** Change this to force the editor to reload `initialContent`. */
  resetKey?: string | number;
  autoFocus?: boolean;
}

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = 'Share what you are building, learning or debugging…',
  ariaLabel,
  resetKey = 0,
  autoFocus,
}: RichTextEditorProps) {
  const contentRef = useRef(initialContent);
  contentRef.current = initialContent;

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      onChange(editor.getJSON() as RichTextDoc);
    },
    [onChange],
  );

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      BulletList,
      ListItem,
      HardBreak,
      History,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https'],
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
      Mention,
    ],
    content: initialContent,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: 'tiptap',
        'aria-label': ariaLabel,
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: handleUpdate,
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(contentRef.current, false);
    // Only reload when the caller explicitly resets the editor.
  }, [resetKey, editor]);

  if (!editor) {
    return (
      <div className="editor-surface min-h-[132px] rounded-md border border-line bg-surface px-3 py-2.5">
        <span className="text-sm text-subtle">Loading editor…</span>
      </div>
    );
  }

  return (
    <div className="editor-surface">
      <Toolbar editor={editor} />
      <div className="pt-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
