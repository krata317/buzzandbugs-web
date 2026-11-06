import { useSettings, useUpdateSettings } from '@/features/settings/queries';
import type { ChannelPrefs, NotificationPrefs } from '@/lib/api/types';
import { errorMessage } from '@/lib/api';
import { Switch } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/feedback';
import { SettingsCard, SaveIndicator } from './SettingsLayout';
import { useToast } from '@/providers/ToastProvider';

const CATEGORIES: Array<{
  key: keyof NotificationPrefs;
  label: string;
  description: string;
}> = [
  { key: 'social', label: 'Social', description: 'Replies, mentions, follows and reposts.' },
  {
    key: 'account',
    label: 'Account',
    description: 'Moderation decisions, warnings and security notices.',
  },
  {
    key: 'community',
    label: 'Community',
    description: 'Product announcements and community-wide updates.',
  },
  { key: 'content', label: 'Content', description: 'Digest-style updates about new content.' },
];

export function NotificationSettings() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const toast = useToast();

  if (settings.isLoading) return <Skeleton className="h-80 w-full rounded-xl" />;

  if (settings.isError || !settings.data) {
    return (
      <SettingsCard title="Notifications" description="These preferences could not be loaded.">
        <p className="text-[12.5px] text-danger">{errorMessage(settings.error)}</p>
      </SettingsCard>
    );
  }

  const prefs = settings.data.notificationPrefs;

  const toggle = (key: keyof NotificationPrefs, channel: keyof ChannelPrefs, value: boolean) => {
    update.mutate(
      { notificationPrefs: { [key]: { [channel]: value } } },
      {
        onError: (error) =>
          toast.push({
            title: 'Could not save the notification setting',
            description: errorMessage(error),
            tone: 'error',
          }),
      },
    );
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        title="Delivery channels"
        description="Choose where each kind of update reaches you. Email is only used for the categories you enable here."
        footer={
          <SaveIndicator
            saving={update.isPending}
            saved={update.isSuccess && !update.isPending}
            error={update.isError ? errorMessage(update.error) : null}
          />
        }
      >
        <div className="hidden grid-cols-[1fr_88px_88px] gap-2 pb-2 sm:grid">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">Category</span>
          <span className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
            In-app
          </span>
          <span className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
            Email
          </span>
        </div>

        <div className="divide-y divide-line">
          {CATEGORIES.map((category) => (
            <div key={category.key} className="grid gap-2 py-3 sm:grid-cols-[1fr_88px_88px]">
              <div>
                <p className="text-[13px] font-medium text-ink">{category.label}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                  {category.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:justify-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-subtle sm:hidden">
                  In-app
                </span>
                <Switch
                  hideLabel
                  label={`${category.label} in-app notifications`}
                  checked={prefs[category.key].onPlatform}
                  disabled={update.isPending}
                  onChange={(value) => toggle(category.key, 'onPlatform', value)}
                />
              </div>

              <div className="flex items-center gap-2 sm:justify-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-subtle sm:hidden">
                  Email
                </span>
                <Switch
                  hideLabel
                  label={`${category.label} email notifications`}
                  checked={prefs[category.key].email}
                  disabled={update.isPending}
                  onChange={(value) => toggle(category.key, 'email', value)}
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <p className="text-[11.5px] leading-relaxed text-subtle">
        Turning off in-app notifications for a category stops new notifications of that type from
        being created. Existing notifications stay until they expire.
      </p>
    </div>
  );
}
