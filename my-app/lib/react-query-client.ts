// lib/react-query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true, // Enable Suspense for all queries
    },
  },
});
