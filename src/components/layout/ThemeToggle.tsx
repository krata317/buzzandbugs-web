import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { IconButton } from '../ui/Button';
import { cn } from '@/lib/cn';
import type { DisplayMode } from '@/lib/api/types';

export function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme();
  const next: DisplayMode = resolvedMode === 'dark' ? 'light' : 'dark';

  return (
    <IconButton
      label={`Switch to ${next} theme`}
      size="sm"
      onClick={() => setMode(next)}
      variant="ghost"
    >
      {resolvedMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </IconButton>
  );
}

const MODES: Array<{ value: DisplayMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeModeControl() {
  const { mode, setMode, isSaving } = useTheme();

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-3 gap-2 rounded-lg bg-raised p-1"
      >
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
                'focus-ring flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150',
                active ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
              )}
            >
              <Icon size={14} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="hint">
        {isSaving ? 'Saving to your account…' : 'Theme changes apply immediately.'}
      </p>
    </div>
  );
}
