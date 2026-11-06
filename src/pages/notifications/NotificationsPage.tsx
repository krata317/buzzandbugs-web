import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CheckCheck,
  Flag,
  Heart,
  MessageSquare,
  Trash2,
  UserPlus,
} from 'lucide-react';
import type { AppNotification, NotificationCategory } from '@/lib/api/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNotificationMutations, useNotifications } from '@/features/notifications/queries';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDateTime, relativeTime } from '@/lib/format';
import { PageHeader, LoadMore, SegmentedControl } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

const CATEGORY_ICON: Record<NotificationCategory, typeof Bell> = {
  SOCIAL: Heart,
  ACCOUNT: Flag,
  COMMUNITY: MessageSquare,
  CONTENT: Bell,
};

function targetFor(notification: AppNotification): string | null {
  const data = notification.data ?? {};

  if (typeof data.appealUrl === 'string') {
    try {
      const url = new URL(data.appealUrl);
      return `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }

  if (typeof data.postId === 'string') return `/posts/${data.postId}`;
  return null;
}

export function NotificationsPage() {
  useDocumentTitle('Notifications');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const notifications = useNotifications(filter === 'unread');
  const { markRead, markAllRead, remove } = useNotificationMutations();
  const navigate = useNavigate();
  const toast = useToast();

  const items = notifications.data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCount = items.filter((item) => !item.read).length;

  const open = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    const target = targetFor(notification);
    if (target) navigate(target);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Mentions, replies, follows and moderation updates. Notifications expire after seven days."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<CheckCheck size={13} />}
            disabled={unreadCount === 0}
            loading={markAllRead.isPending}
            onClick={() =>
              markAllRead.mutate(undefined, {
                onSuccess: () => toast.push({ title: 'All notifications marked read', tone: 'success' }),
                onError: (error) =>
                  toast.push({
                    title: 'Could not mark notifications read',
                    description: errorMessage(error),
                    tone: 'error',
                  }),
              })
            }
          >
            Mark all read
          </Button>
        }
      />

      <SegmentedControl
        label="Filter notifications"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread', count: unreadCount },
        ]}
      />

      {notifications.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-[74px] w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {notifications.isError ? (
        <ErrorState
          title="Notifications could not load"
          description={errorMessage(notifications.error)}
          onRetry={() => void notifications.refetch()}
        />
      ) : null}

      {notifications.data && items.length === 0 ? (
        <EmptyState
          icon={filter === 'unread' ? <BellOff size={22} /> : <Bell size={22} />}
          title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'You are all caught up.'
              : 'When someone replies, mentions you or your post is reviewed, it appears here.'
          }
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {items.map((notification) => {
            const Icon = CATEGORY_ICON[notification.category] ?? Bell;
            const target = targetFor(notification);

            return (
              <li
                key={notification.id}
                className={cn(
                  'group relative flex items-start gap-3 px-4 py-3.5 transition-colors',
                  !notification.read && 'bg-accent/[0.04]',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    notification.read ? 'bg-raised text-subtle' : 'bg-accent/10 text-accent',
                  )}
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => open(notification)}
                    disabled={!target}
                    className={cn(
                      'focus-ring block w-full rounded-sm text-left',
                      target ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <span className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          'text-[13.5px] leading-snug',
                          notification.read ? 'text-ink' : 'font-medium text-ink',
                        )}
                      >
                        {notification.title}
                      </span>
                      {!notification.read ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          aria-label="Unread"
                        />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                      {notification.body}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                      {relativeTime(notification.createdAt)}
                      <span className="sr-only"> — {formatDateTime(notification.createdAt)}</span>
                    </span>
                  </button>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  {!notification.read ? (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(notification.id)}
                      aria-label="Mark as read"
                      title="Mark as read"
                      className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-raised hover:text-ink"
                    >
                      <CheckCheck size={14} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      remove.mutate(notification.id, {
                        onError: (error) =>
                          toast.push({
                            title: 'Could not delete the notification',
                            description: errorMessage(error),
                            tone: 'error',
                          }),
                      })
                    }
                    aria-label="Delete notification"
                    title="Delete"
                    className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-raised hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {notifications.hasNextPage ? (
        <LoadMore
          onClick={() => void notifications.fetchNextPage()}
          loading={notifications.isFetchingNextPage}
        />
      ) : null}

      <p className="flex items-center gap-1.5 pt-2 text-[11.5px] text-subtle">
        <UserPlus size={12} aria-hidden="true" />
        Delivery channels can be changed in Settings → Notifications.
      </p>
    </div>
  );
}
