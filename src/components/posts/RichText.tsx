import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { RichTextDoc, RichTextMark, RichTextNode } from '@/lib/api/types';
import { isHttpUrl } from '@/lib/richText';

function withMarks(text: string, marks: RichTextMark[] | undefined): ReactElement {
  let content: ReactElement = <>{text}</>;

  for (const mark of marks ?? []) {
    if (mark.type === 'bold') content = <strong>{content}</strong>;
    else if (mark.type === 'italic') content = <em>{content}</em>;
    else if (mark.type === 'underline') content = <u>{content}</u>;
    else if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : null;
      if (href && isHttpUrl(href)) {
        content = (
          <a href={href} target="_blank" rel="noreferrer noopener nofollow">
            {content}
          </a>
        );
      }
    } else if (mark.type === 'fontSize') {
      const size = typeof mark.attrs?.size === 'string' ? mark.attrs.size : null;
      if (size) content = <span style={{ fontSize: size }}>{content}</span>;
    }
  }

  return content;
}

function Inline({ node }: { node: RichTextNode }) {
  if (node.type === 'text') {
    return <>{withMarks(node.text ?? '', node.marks)}</>;
  }

  if (node.type === 'hardBreak') return <br />;

  if (node.type === 'mention') {
    const attrs = node.attrs ?? {};
    const label = typeof attrs.label === 'string' ? attrs.label : null;
    const username = typeof attrs.username === 'string' ? attrs.username : null;
    const deleted = attrs.deleted === true;

    if (username && !deleted) {
      return (
        <Link to={`/users/${username}`} className="mention" title={label ?? `@${username}`}>
          @{username}
        </Link>
      );
    }

    return <span className="mention">{deleted ? '@deleted account' : `@${label ?? 'user'}`}</span>;
  }

  return null;
}

function Block({ node }: { node: RichTextNode }) {
  if (node.type === 'paragraph') {
    const children = node.content ?? [];
    if (children.length === 0) return null;
    return (
      <p>
        {children.map((child, index) => (
          <Inline key={index} node={child} />
        ))}
      </p>
    );
  }

  if (node.type === 'bulletList') {
    return (
      <ul>
        {(node.content ?? []).map((item, index) => (
          <li key={index}>
            {(item.content ?? []).map((child, childIndex) => (
              <Block key={childIndex} node={child} />
            ))}
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

export function RichText({
  doc,
  className,
}: {
  doc: RichTextDoc | RichTextNode | null | undefined;
  className?: string;
}) {
  if (!doc) return null;
  const blocks = doc.content ?? [];
  if (blocks.length === 0) return null;

  return (
    <div className={className ?? 'post-body'}>
      {blocks.map((block, index) => (
        <Block key={index} node={block} />
      ))}
    </div>
  );
}
