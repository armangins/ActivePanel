import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/woocommerce';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { useWooCommerceSettings } from './useWooCommerceSettings';

const PER_PAGE = PAGINATION_DEFAULTS.PRODUCTS_PER_PAGE;

// OPTIMIZATION: Default fields for different views
const DEFAULT_PRODUCT_FIELDS = 'id,name,type,status,stock_status,stock_quantity,price,regular_price,sale_price,images,categories,sku,attributes,variations';
const MINIMAL_PRODUCT_FIELDS = 'id,name,type,status,stock_status,stock_quantity,regular_price,sale_price,images,categories,sku';

// Query keys
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), { filters }],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  totalCount: () => [...productKeys.all, 'totalCount'],
  lowStock: () => [...productKeys.all, 'lowStock'],
};

// Fetch products list
export const useProducts = (filters = {}, options = {}) => {
  const { hasSettings } = useWooCommerceSettings();

  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsAPI.list({
      page: 1,
      per_page: PER_PAGE,
      _fields: DEFAULT_PRODUCT_FIELDS,
      ...filters,
    }),
    enabled: hasSettings,
    staleTime: 15 * 60 * 1000,
    ...options, // Merge external options
  });
};

// Fetch products list with infinite scroll
export const useInfiniteProducts = (filters = {}) => {
  const { hasSettings } = useWooCommerceSettings();

  return useInfiniteQuery({
    queryKey: productKeys.list({ ...filters, type: 'infinite' }),
    queryFn: ({ pageParam = 1 }) => productsAPI.list({
      page: pageParam,
      per_page: filters.per_page || PER_PAGE,
      _fields: filters._fields || MINIMAL_PRODUCT_FIELDS,
      ...filters,
    }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    enabled: hasSettings,
    staleTime: 15 * 60 * 1000,
    // PERFORMANCE: Use placeholderData for instant display from cache
    placeholderData: (previousData) => previousData,
  });
};

// Fetch single product
export const useProduct = (id) => {
  const { hasSettings } = useWooCommerceSettings();

  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsAPI.get(id),
    enabled: !!id && hasSettings,
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch total products count
export const useProductsTotalCount = () => {
  const { hasSettings } = useWooCommerceSettings();

  return useQuery({
    queryKey: productKeys.totalCount(),
    queryFn: () => productsAPI.getTotalCount(),
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch low stock products
export const useLowStockProducts = (threshold = 2) => {
  const { hasSettings } = useWooCommerceSettings();

  return useQuery({
    queryKey: [...productKeys.lowStock(), threshold],
    queryFn: () => productsAPI.getLowStockProducts(threshold),
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: 15 * 60 * 1000, // 5 minutes for stock data
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => productsAPI.create(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
};

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

