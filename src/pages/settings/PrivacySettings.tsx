import { useSettings, useUpdateSettings } from '@/features/settings/queries';
import type { ProfileVisibility } from '@/lib/api/types';
import { errorMessage } from '@/lib/api';
import { Switch } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/feedback';
import { SettingsCard, SaveIndicator } from './SettingsLayout';
import { useToast } from '@/providers/ToastProvider';

const FIELDS: Array<{ key: keyof ProfileVisibility; label: string; description: string }> = [
  {
    key: 'about',
    label: 'About section',
    description: 'The short biography on your public profile.',
  },
  {
    key: 'socialLinks',
    label: 'Social links',
    description: 'Links to your GitHub, website and other profiles.',
  },
  {
    key: 'followers',
    label: 'Follower count',
    description: 'Whether other people can see how many followers you have.',
  },
  {
    key: 'following',
    label: 'Following count',
    description: 'Whether other people can see how many accounts you follow.',
  },
];

export function PrivacySettings() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const toast = useToast();

  if (settings.isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (settings.isError || !settings.data) {
    return (
      <SettingsCard title="Privacy" description="These preferences could not be loaded.">
        <p className="text-[12.5px] text-danger">{errorMessage(settings.error)}</p>
      </SettingsCard>
    );
  }

  const visibility = settings.data.profileVisibility;

  const toggle = (key: keyof ProfileVisibility, value: boolean) => {
    update.mutate(
      { profileVisibility: { [key]: value } },
      {
        onError: (error) =>
          toast.push({
            title: 'Could not save the privacy setting',
            description: errorMessage(error),
            tone: 'error',
          }),
      },
    );
  };

  return (
    <SettingsCard
      title="Public profile visibility"
      description="Hidden details are removed from the API response, not just the interface."
      footer={
        <SaveIndicator
          saving={update.isPending}
          saved={update.isSuccess && !update.isPending}
          error={update.isError ? errorMessage(update.error) : null}
        />
      }
    >
      <div className="divide-y divide-line">
        {FIELDS.map((field) => (
          <Switch
            key={field.key}
            label={field.label}
            description={field.description}
            checked={visibility[field.key]}
            disabled={update.isPending}
            onChange={(value) => toggle(field.key, value)}
          />
        ))}
      </div>
    </SettingsCard>
  );
}
