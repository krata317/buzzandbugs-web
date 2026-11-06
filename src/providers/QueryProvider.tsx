import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { isApiError, isNetworkError } from '@/lib/api';

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiError(error)) return error.status >= 500 && failureCount < 2;
          if (isNetworkError(error)) return failureCount < 2;
          return false;
        },
        retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 6000),
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
