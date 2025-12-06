import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { variationsAPI } from '../services/woocommerce';

// Query keys
export const variationKeys = {
    all: ['variations'],
    lists: () => [...variationKeys.all, 'list'],
    list: (productId) => [...variationKeys.lists(), productId],
    details: () => [...variationKeys.all, 'detail'],
    detail: (productId, variationId) => [...variationKeys.details(), productId, variationId],
};

/**
 * Fetch all variations for a product
 * @param {number} productId - Product ID
 * @param {object} options - React Query options
 */
export const useVariations = (productId, options = {}) => {
    return useQuery({
        queryKey: variationKeys.list(productId),
        queryFn: () => variationsAPI.list(productId),
        enabled: !!productId && options.enabled !== false,
        staleTime: 15 * 60 * 1000, // 15 minutes
        ...options,
    });
};

/**
 * Fetch single variation
 * @param {number} productId - Product ID
 * @param {number} variationId - Variation ID
 */
export const useVariation = (productId, variationId) => {
    return useQuery({
        queryKey: variationKeys.detail(productId, variationId),
        queryFn: () => variationsAPI.getById(productId, variationId),
        enabled: !!productId && !!variationId,
        staleTime: 15 * 60 * 1000,
    });
};

/**
 * Create variation mutation
 */
export const useCreateVariation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, data }) => variationsAPI.create(productId, data),
        onSuccess: (data, variables) => {
            // Invalidate variations list for this product
            queryClient.invalidateQueries({
                queryKey: variationKeys.list(variables.productId)
            });
            // Also invalidate the parent product
            queryClient.invalidateQueries({
                queryKey: ['products', 'detail', variables.productId]
            });
        },
    });
};

/**
 * Update variation mutation
 */
export const useUpdateVariation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, variationId, data }) =>
            variationsAPI.update(productId, variationId, data),
        onSuccess: (data, variables) => {
            // Invalidate variations list
            queryClient.invalidateQueries({
                queryKey: variationKeys.list(variables.productId)
            });
            // Invalidate specific variation
            queryClient.invalidateQueries({
                queryKey: variationKeys.detail(variables.productId, variables.variationId)
            });
            // Invalidate parent product
            queryClient.invalidateQueries({
                queryKey: ['products', 'detail', variables.productId]
            });
        },
    });
};

/**
 * Delete variation mutation
 */
export const useDeleteVariation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, variationId }) =>
            variationsAPI.delete(productId, variationId),
        onSuccess: (data, variables) => {
            // Invalidate variations list
            queryClient.invalidateQueries({
                queryKey: variationKeys.list(variables.productId)
            });
            // Invalidate parent product
            queryClient.invalidateQueries({
                queryKey: ['products', 'detail', variables.productId]
            });
        },
    });
};

/**
 * Batch variations mutation (create, update, delete multiple)
 */
export const useBatchVariations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, data }) =>
            variationsAPI.batch(productId, data),
        onSuccess: (data, variables) => {
            // Invalidate all variations for this product
            queryClient.invalidateQueries({
                queryKey: variationKeys.list(variables.productId)
            });
            // Invalidate parent product
            queryClient.invalidateQueries({
                queryKey: ['products', 'detail', variables.productId]
            });
        },
    });
};
