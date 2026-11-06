import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';
import type { AccentColor, DisplayMode, Settings } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from './AuthProvider';
import { readThemePreference, writeThemePreference } from '@/lib/storage';

interface ThemeContextValue {
  mode: DisplayMode;
  accent: AccentColor;
  resolvedMode: 'light' | 'dark';
  isSaving: boolean;
  syncedToAccount: boolean;
  setMode: (mode: DisplayMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, me } = useAuth();
  const queryClient = useQueryClient();
  const [local, setLocal] = useState(() => readThemePreference());
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: ({ signal }) => settingsApi.read(signal),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings, data);
    },
    onError: () => {
      void settingsQuery.refetch();
    },
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const serverSettings = settingsQuery.data ?? me?.settings ?? null;
  const syncedToAccount = isAuthenticated && Boolean(serverSettings);

  const mode: DisplayMode = syncedToAccount && serverSettings ? serverSettings.displayMode : local.mode;
  const accent: AccentColor =
    syncedToAccount && serverSettings ? serverSettings.accentColor : local.accent;

  const resolvedMode: 'light' | 'dark' =
    mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedMode === 'dark');
    root.dataset.accent = accent;
    root.style.colorScheme = resolvedMode;
    writeThemePreference({ mode, accent });
  }, [resolvedMode, accent, mode]);

  const setMode = useCallback(
    (next: DisplayMode) => {
      if (isAuthenticated) {
        queryClient.setQueryData<Settings | undefined>(queryKeys.settings, (current) =>
          current ? { ...current, displayMode: next } : current,
        );
        mutation.mutate({ displayMode: next });
        return;
      }
      setLocal((current) => ({ ...current, mode: next }));
    },
    [isAuthenticated, mutation, queryClient],
  );

  const setAccent = useCallback(
    (next: AccentColor) => {
      if (isAuthenticated) {
        queryClient.setQueryData<Settings | undefined>(queryKeys.settings, (current) =>
          current ? { ...current, accentColor: next } : current,
        );
        mutation.mutate({ accentColor: next });
        return;
      }
      setLocal((current) => ({ ...current, accent: next }));
    },
    [isAuthenticated, mutation, queryClient],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      accent,
      resolvedMode,
      isSaving: mutation.isPending,
      syncedToAccount,
      setMode,
      setAccent,
    }),
    [mode, accent, resolvedMode, mutation.isPending, syncedToAccount, setMode, setAccent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
