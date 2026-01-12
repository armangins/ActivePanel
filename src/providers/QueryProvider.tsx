import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with optimized defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 15 * 60 * 1000, // 15 minutes (renamed from cacheTime in v5)
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * React Query Provider
 * 
 * Configures the global QueryClient for data fetching.
 * Sets default stale times, caching strategies, and refetch behaviors.
 * 
 * @param children - Child components to wrap
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
