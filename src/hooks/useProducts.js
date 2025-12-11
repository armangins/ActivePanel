import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { productsAPI } from '../services/woocommerce';
import { PAGINATION_DEFAULTS } from '../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.PRODUCTS_PER_PAGE;

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
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsAPI.list({
      page: filters.page || 1,
      per_page: filters.per_page || PER_PAGE,
      _fields: filters._fields || 'id,name,type,status,stock_status,stock_quantity,price,regular_price,sale_price,images,categories,sku',
      ...filters,
    }),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Fetch products list with infinite scroll
export const useInfiniteProducts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: productKeys.list({ ...filters, type: 'infinite' }),
    queryFn: ({ pageParam = 1 }) => productsAPI.list({
      page: pageParam,
      per_page: filters.per_page || PER_PAGE,
      // PERFORMANCE: Default to minimal fields for faster loading
      // Only request 'price' field if explicitly needed (we prefer regular_price)
      _fields: filters._fields || 'id,name,type,status,stock_status,stock_quantity,regular_price,sale_price,images,categories,sku',
      ...filters,
    }),
    getNextPageParam: (lastPage, allPages) => {
      // lastPage is the result from productsAPI.list
      // It contains { data: [...], total: X, totalPages: Y }
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    // PERFORMANCE: Use placeholderData for instant display from cache
    // This provides better perceived performance by showing cached data immediately
    placeholderData: (previousData) => previousData,
    // PERFORMANCE: Keep previous data while fetching new data
    // This prevents flickering when refetching
    keepPreviousData: true,
  });
};

// Fetch all products (for client-side filtering)
export const useAllProducts = () => {
  return useQuery({
    queryKey: [...productKeys.all, 'all'],
    queryFn: async () => {
      let allProducts = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await productsAPI.list({
          page,
          per_page: 100,
        });
        allProducts = [...allProducts, ...response.data];
        hasMore = page < response.totalPages;
        page++;
      }

      return allProducts;
    },
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsAPI.get(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch total products count
export const useProductsTotalCount = () => {
  return useQuery({
    queryKey: productKeys.totalCount(),
    queryFn: () => productsAPI.getTotalCount(),
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch low stock products
export const useLowStockProducts = (threshold = 2) => {
  return useQuery({
    queryKey: [...productKeys.lowStock(), threshold],
    queryFn: () => productsAPI.getLowStockProducts(threshold),
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

