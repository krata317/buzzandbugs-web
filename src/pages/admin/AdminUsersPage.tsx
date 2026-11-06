import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAdminUsers } from '@/features/admin/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { errorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { AdminHeader, AdminTable, Td, Th } from './adminUi';
import { Badge, EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { Input } from '@/components/ui/form';

export function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim(), 350);
  const results = useAdminUsers(debounced);

  return (
    <div>
      <AdminHeader
        title="User lookup"
        description="Search is exact-substring on username and email, case-insensitive on display name."
      />

      <div className="relative max-w-md">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Username, display name or email"
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      <div className="mt-4">
        {debounced.length === 0 ? (
          <EmptyState
            compact
            title="Enter at least one character"
            description="Results are limited to 20 accounts, newest first."
          />
        ) : null}

        {results.isLoading && debounced.length > 0 ? (
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : null}

        {results.isError ? (
          <ErrorState
            title="Search failed"
            description={errorMessage(results.error)}
            onRetry={() => void results.refetch()}
          />
        ) : null}

        {results.data && results.data.length === 0 ? (
          <EmptyState compact title="No accounts matched" description="Try a shorter query." />
        ) : null}

        {results.data && results.data.length > 0 ? (
          <AdminTable>
            <thead>
              <tr>
                <Th>Account</Th>
                <Th>Email</Th>
                <Th>Joined</Th>
                <Th className="text-right">Posts</Th>
                <Th className="text-right">Warnings</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {results.data.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-raised/40">
                  <Td>
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="focus-ring font-medium text-ink hover:text-accent"
                    >
                      {user.displayName}
                    </Link>
                    <span className="ml-2 font-mono text-[10.5px] text-subtle">@{user.username}</span>
                  </Td>
                  <Td className="font-mono text-[11.5px] text-muted">{user.email}</Td>
                  <Td className="font-mono text-[11px] text-subtle">{formatDate(user.createdAt)}</Td>
                  <Td className="text-right font-mono text-[11.5px]">{user.postCount}</Td>
                  <Td className="text-right font-mono text-[11.5px]">{user.warningCount}</Td>
                  <Td>
                    {user.ban.banned ? (
                      <Badge tone="danger">{user.ban.permanent ? 'Permanent ban' : 'Banned'}</Badge>
                    ) : (
                      <Badge tone="success">Active</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        ) : null}
      </div>
    </div>
  );
}
