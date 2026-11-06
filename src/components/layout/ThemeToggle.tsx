import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { IconButton } from '../ui/Button';
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
