import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, isApiError } from '@/lib/api';
import { UNAUTHORIZED_EVENT } from '@/lib/api/client';
import type { MeResponse } from '@/lib/api/types';
import { queryKeys } from '@/features/queryKeys';

interface AuthContextValue {
  me: MeResponse | null;
  user: MeResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingDeletion: MeResponse['pendingDeletion'];
  refresh: () => Promise<unknown>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async ({ signal }) => {
      try {
        return await authApi.me(signal);
      } catch (error) {
        // A signed-out visitor is a valid state, not an error.
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (isApiError(error)) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ scope?: string }>).detail;
      if (detail?.scope && detail.scope !== 'user') return;
      queryClient.setQueryData(queryKeys.me, null);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [queryClient]);

  const signOut = useCallback(async () => {
    // Cancel any in-flight /auth/me request first: if it resolved after the cache was cleared
    // it would restore the session in the UI and make sign-out look broken until a reload.
    await queryClient.cancelQueries({ queryKey: queryKeys.me });

    try {
      await authApi.logout();
    } catch {
      // The session may already be gone; signing out locally is still correct.
    }

    queryClient.setQueryData(queryKeys.me, null);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'admin' && query.queryKey[0] !== 'me',
    });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const me = meQuery.data ?? null;
    return {
      me,
      user: me?.user ?? null,
      isLoading: meQuery.isLoading,
      isAuthenticated: Boolean(me),
      pendingDeletion: me?.pendingDeletion ?? null,
      refresh: meQuery.refetch,
      signOut,
    };
  }, [meQuery.data, meQuery.isLoading, meQuery.refetch, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
