import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { productsService } from '../api/products.service';
import { ProductsResponse, Product, CreateProductData, UpdateProductData } from '../types';
import { useSettings } from '@/features/settings';

import { productsResponseSchema, productResponseSchema } from '../types/schemas';

// Infinite Query Hook
export const useInfiniteProducts = (params: any = {}) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useInfiniteQuery<ProductsResponse>({
        queryKey: ['products', 'infinite', params],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const data = await productsService.getProducts({ ...params, page: pageParam as number });
            // Note: Infinite query pagination structure might differ, validating page data
            return productsResponseSchema.parse(data);
        },
        getNextPageParam: (lastPage: any, allPages) => {
            // Assuming API returns totalPages or we calculate it
            const currentPage = allPages.length;
            return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
        },
        enabled: isConfigured
    });
};

// Standard Query Hook (for specific pages or details not infinite)
export const useProductsData = (params: any = {}, queryOptions: any = {}) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<ProductsResponse>({
        queryKey: ['products', params],
        queryFn: async () => {
            const data = await productsService.getProducts(params);
            return productsResponseSchema.parse(data);
        },
        enabled: isConfigured && (queryOptions.enabled !== false),
        placeholderData: (previousData) => previousData,
        ...queryOptions
    });
};

export const useProductDetail = (id: number | null) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const data = await productsService.getProductById(id!);
            return productResponseSchema.parse(data);
        },
        enabled: isConfigured && !!id
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductData) => productsService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<UpdateProductData> }) =>
            productsService.updateProduct(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.id] });
        }
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productsService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

export const useBulkDeleteProducts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: number[]) => productsService.bulkDeleteProducts(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

export const useVariations = (productId: number) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery({
        queryKey: ['products', productId, 'variations'],
        queryFn: () => productsService.getVariations(productId),
        enabled: isConfigured && !!productId
    });
};

export const useCreateVariation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, data }: { productId: number; data: any }) =>
            productsService.createVariation(productId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products', variables.productId, 'variations'] });
        }
    });
};

export const useUpdateVariation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, variationId, data }: { productId: number; variationId: number; data: any }) =>
            productsService.updateVariation(productId, variationId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products', variables.productId, 'variations'] });
        }
    });
};

export const useDeleteVariation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, variationId }: { productId: number; variationId: number }) =>
            productsService.deleteVariation(productId, variationId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products', variables.productId, 'variations'] });
        }
    });
};

export const useBatchVariations = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, data }: { productId: number; data: any }) =>
            productsService.batchVariations(productId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products', variables.productId, 'variations'] });
        }
    });
};
