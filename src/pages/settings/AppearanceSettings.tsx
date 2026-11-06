import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettings, useUpdateSettings } from '@/features/settings/queries';
import { ACCENT_COLORS } from '@/lib/storage';
import { cn } from '@/lib/cn';
import { SettingsCard } from './SettingsLayout';
import { Skeleton } from '@/components/ui/feedback';
import { errorMessage } from '@/lib/api';
import type { AccentColor, DisplayMode } from '@/lib/api/types';

const MODES: Array<{ value: DisplayMode; label: string; icon: typeof Sun; hint: string }> = [
  { value: 'light', label: 'Light', icon: Sun, hint: 'Warm paper surfaces' },
  { value: 'dark', label: 'Dark', icon: Moon, hint: 'Graphite surfaces' },
  { value: 'system', label: 'System', icon: Monitor, hint: 'Follow the OS' },
];

export function AppearanceSettings() {
  const { mode, accent, setMode, setAccent, syncedToAccount } = useTheme();
  const settings = useSettings();
  const update = useUpdateSettings();

  if (settings.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsCard
        title="Theme"
        description={
          syncedToAccount
            ? 'Saved to your account and applied on every device you sign in from.'
            : 'Saved in this browser. Sign in to keep the preference across devices.'
        }
      >
        <div role="radiogroup" aria-label="Theme" className="grid gap-2 sm:grid-cols-3">
          {MODES.map((option) => {
            const Icon = option.icon;
            const active = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(option.value)}
                className={cn(
                  'focus-ring flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all duration-150',
                  active
                    ? 'border-accent/40 bg-accent/[0.06]'
                    : 'border-line hover:border-lineStrong hover:bg-raised/40',
                )}
              >
                <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  <Icon
                    size={14}
                    className={active ? 'text-accent' : 'text-subtle'}
                    aria-hidden="true"
                  />
                  {option.label}
                </span>
                <span className="text-[11.5px] text-muted">{option.hint}</span>
              </button>
            );
          })}
        </div>
        {update.isError ? (
          <p className="mt-3 text-[11.5px] text-danger">{errorMessage(update.error)}</p>
        ) : null}
      </SettingsCard>

      <SettingsCard
        title="Accent colour"
        description="Used for primary actions, active navigation and links. Contrast is checked for both themes."
      >
        <div className="flex flex-wrap gap-2.5">
          {ACCENT_COLORS.map((option) => {
            const active = accent === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                aria-pressed={active}
                onClick={() => setAccent(option.value as AccentColor)}
                className={cn(
                  'focus-ring flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-all duration-150',
                  active
                    ? 'border-accent/40 bg-accent/[0.06] text-ink'
                    : 'border-line text-muted hover:border-lineStrong hover:text-ink',
                )}
              >
                <span
                  className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: `rgb(${accentRgb(option.value)})` }}
                  aria-hidden="true"
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard title="Preview" description="A small sample of the current theme.">
        <div className="rounded-lg border border-line bg-surface p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-raised" aria-hidden="true" />
            <span className="text-[12.5px] font-medium text-ink">Display name</span>
            <span className="font-mono text-[10.5px] text-subtle">@username</span>
          </div>
          <p className="mt-2 text-[13px] font-semibold text-ink">A post title in this theme</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Body copy uses the muted token, so it stays readable without competing with the title.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-md bg-accent px-2.5 py-1 text-[11.5px] font-medium text-accentInk">
              Primary
            </span>
            <span className="rounded-md border border-line px-2.5 py-1 text-[11.5px] text-ink">
              Secondary
            </span>
            <span className="text-[11.5px] text-accent underline underline-offset-2">A link</span>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

/** Mirrors the accent values defined in the stylesheet, for the swatch preview only. */
function accentRgb(accent: AccentColor): string {
  const map: Record<AccentColor, string> = {
    violet: '109 74 255',
    blue: '37 99 235',
    green: '14 124 74',
    amber: '176 82 9',
    rose: '211 38 112',
    teal: '13 116 108',
    slate: '71 85 105',
  };
  return map[accent];
}
