import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';
import type { Settings, SettingsPatch } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';
import { useAuth } from '@/providers/AuthProvider';

export function useSettings() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: ({ signal }) => settingsApi.read(signal),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: SettingsPatch) => settingsApi.update(patch),
    onSuccess: (settings) => {
      queryClient.setQueryData<Settings>(queryKeys.settings, settings);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      void queryClient.invalidateQueries({ queryKey: ['external'] });
    },
  });
}
