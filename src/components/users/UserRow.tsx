import { Link } from 'react-router-dom';
import type { PublicAuthor } from '@/lib/api/types';
import { Avatar } from '@/components/ui/Avatar';

export function UserRow({ user }: { user: PublicAuthor }) {
  const href = user.username ? `/users/${user.username}` : '/users/deleted';

  return (
    <li>
      <Link
        to={href}
        className="focus-ring flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-raised/60"
      >
        <Avatar src={user.avatarUrl} name={user.displayName} size="sm" ring />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium text-ink">
            {user.displayName}
          </span>
          {user.username ? (
            <span className="block truncate font-mono text-[11px] text-subtle">
              @{user.username}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}
