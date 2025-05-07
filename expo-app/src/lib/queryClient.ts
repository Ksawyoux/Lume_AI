import { QueryClient } from '@tanstack/react-query';
import { fetcher } from './db';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const apiRequest = async <T>({
  url,
  method = 'POST',
  body,
}: {
  url: string;
  method?: 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}): Promise<T> => {
  return fetcher({
    url,
    method,
    body,
  });
};