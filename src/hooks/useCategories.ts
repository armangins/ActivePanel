import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { categoriesAPI } from '../services/woocommerce';
import { useWooCommerceSettings } from './useWooCommerceSettings';

interface CategoryQueries {
    all: string[];
    lists: () => string[];
    list: (filters: any) => any[];
    details: () => string[];
    detail: (id: number | string) => any[];
}

// Query keys
export const categoryKeys: CategoryQueries = {
    all: ['categories'],
    lists: () => [...categoryKeys.all, 'list'],
    list: (filters: any) => [...categoryKeys.lists(), { filters }],
    details: () => [...categoryKeys.all, 'detail'],
    detail: (id: number | string) => [...categoryKeys.details(), id],
};

/**
 * Hook to fetch all categories
 * Only executes if WooCommerce settings are configured.
 * Uses infinite stale time as categories rarely change.
 */
export const useCategories = (): UseQueryResult<any[], Error> => {
    const { hasSettings } = useWooCommerceSettings();

    return useQuery({
        queryKey: categoryKeys.all,
        queryFn: () => categoriesAPI.getAll(),
        enabled: hasSettings, // Only fetch if settings are configured
        staleTime: Infinity, // Categories rarely change, cache indefinitely
        select: (data: any) => data.data || data, // Extract the categories array from the response object
    });
};
