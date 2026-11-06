import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
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
import { useQuery } from '@tanstack/react-query';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List,
  Underline as UnderlineIcon,
} from 'lucide-react';
import type { PublicAuthor, RichTextDoc } from '@/lib/api/types';
import { usersApi } from '@/lib/api';
import { AUTO_LINK_PLUGIN_KEY, createAutoLinkPlugin } from '@/lib/autoLink';
import { cn } from '@/lib/cn';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Avatar } from '@/components/ui/Avatar';

/** A mention is stored as a user id; the label is re-resolved by the API on read. */
const Mention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null, parseHTML: (element) => element.getAttribute('data-mention-id') },
      label: { default: null, parseHTML: (element) => element.getAttribute('data-mention-label') },
      username: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-mention-username'),
      },
      deleted: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-mention-deleted') === 'true',
      },
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
      mergeAttributes({
        'data-mention-id': HTMLAttributes.id,
        'data-mention-label': HTMLAttributes.label ?? undefined,
        'data-mention-username': HTMLAttributes.username ?? undefined,
        class: 'mention',
      }),
      `@${label}`,
    ];
  },

  renderText({ node }) {
    const label = node.attrs.label ?? node.attrs.username ?? 'user';
    return `@${label}`;
  },
});

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({ label, active, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
        active ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-raised hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5 border-b border-line pb-2">
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
    </div>
  );
}

interface Suggestion {
  query: string;
  from: number;
  to: number;
}

const MENTION_TRIGGER = /(?:^|[\s(])@([a-zA-Z0-9_]{0,20})$/;

function detectSuggestion(editor: Editor): Suggestion | null {
  const { state } = editor;
  const { $from } = state.selection;
  if (!$from.parent.isTextblock) return null;

  const start = Math.max(0, $from.parentOffset - 32);
  const before = $from.parent.textBetween(start, $from.parentOffset, undefined, '\ufffc');
  const match = MENTION_TRIGGER.exec(before);
  if (!match) return null;

  const query = match[1] ?? '';
  const to = $from.pos;
  return { query, from: to - query.length - 1, to };
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

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [highlighted, setHighlighted] = useState(0);

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      if (editor.isDestroyed) return;
      onChange(editor.getJSON() as RichTextDoc);
      setSuggestion(detectSuggestion(editor));
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
      // Links are created automatically from the text itself; there is no manual tool.
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: false,
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
        'aria-autocomplete': 'list',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: handleUpdate,
    onSelectionUpdate: ({ editor: instance }) => {
      if (instance.isDestroyed) return;
      setSuggestion(detectSuggestion(instance));
    },
    onBlur: () => setSuggestion(null),
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.commands.setContent(contentRef.current, false);
    // Only reload when the caller explicitly resets the editor.
  }, [resetKey, editor]);

  // Attach the automatic link pass once the editor exists.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.registerPlugin(createAutoLinkPlugin());
    return () => {
      if (!editor.isDestroyed) editor.unregisterPlugin(AUTO_LINK_PLUGIN_KEY);
    };
  }, [editor]);

  const debouncedQuery = useDebouncedValue(suggestion?.query ?? '', 200);
  const searching = Boolean(suggestion) && debouncedQuery.trim().length >= 1;

  const people = useQuery({
    queryKey: ['mention-search', debouncedQuery],
    queryFn: ({ signal }) => usersApi.search(debouncedQuery, signal),
    enabled: searching,
    staleTime: 30_000,
  });

  const results = people.data ?? [];

  useEffect(() => {
    setHighlighted(0);
  }, [debouncedQuery, results.length]);

  const closeSuggestions = () => setSuggestion(null);

  const insertMention = (person: PublicAuthor) => {
    if (!editor || editor.isDestroyed || !suggestion || !person.username || !person.id) return;

    editor
      .chain()
      .focus()
      .insertContentAt(
        { from: suggestion.from, to: suggestion.to },
        [
          {
            type: 'mention',
            attrs: { id: person.id, label: person.displayName, username: person.username },
          },
          { type: 'text', text: ' ' },
        ],
        { updateSelection: true },
      )
      .run();

    closeSuggestions();
  };

  const onKeyDownCapture = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!suggestion || !editor || editor.isDestroyed) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeSuggestions();
      return;
    }

    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const person = results[highlighted];
      if (person) insertMention(person);
    }
  };

  if (!editor) {
    return (
      <div className="editor-surface min-h-[132px] rounded-md border border-line bg-surface px-3 py-2.5">
        <span className="text-sm text-subtle">Loading editor…</span>
      </div>
    );
  }

  return (
    <div className="editor-surface relative" onKeyDownCapture={onKeyDownCapture}>
      <Toolbar editor={editor} />
      <div className="pt-2">
        <EditorContent editor={editor} />
      </div>

      {suggestion ? (
        <div
          className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-lift"
          aria-live="polite"
        >
          {!searching ? (
            <p className="px-3 py-2.5 text-[12.5px] text-muted">
              Keep typing to find someone to mention.
            </p>
          ) : people.isLoading ? (
            <p className="px-3 py-2.5 text-[12.5px] text-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2.5 text-[12.5px] text-muted">No one matches that name.</p>
          ) : (
            <ul role="listbox" aria-label="People you can mention" className="max-h-60 overflow-y-auto p-1">
              {results.map((person, index) => (
                <li
                  key={person.id ?? person.username}
                  role="option"
                  aria-selected={index === highlighted}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => insertMention(person)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
                      index === highlighted ? 'bg-raised' : 'hover:bg-raised/60',
                    )}
                  >
                    <Avatar src={person.avatarUrl} name={person.displayName} size="xs" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {person.displayName}
                      </span>
                      <span className="block truncate font-mono text-[10.5px] text-subtle">
                        @{person.username}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
