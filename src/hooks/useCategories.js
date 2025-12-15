import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '../services/woocommerce';
import { useWooCommerceSettings } from './useWooCommerceSettings';

// Query keys
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  list: (filters) => [...categoryKeys.lists(), { filters }],
  details: () => [...categoryKeys.all, 'detail'],
  detail: (id) => [...categoryKeys.details(), id],
};

// Fetch all categories
export const useCategories = () => {
  const { hasSettings } = useWooCommerceSettings();
  
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoriesAPI.getAll(),
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: Infinity, // Categories rarely change, cache indefinitely
  });
};













