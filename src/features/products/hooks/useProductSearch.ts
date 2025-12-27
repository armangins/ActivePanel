import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../api/products.service';

// Stable empty array reference
const EMPTY_ARRAY: any[] = [];

export const useProductSearch = (enabled: boolean = true) => {
    // 1. Fetch the lightweight index of ALL products
    const { data: allProducts = EMPTY_ARRAY, isLoading, isError } = useQuery({
        queryKey: ['products', 'light-index'],
        queryFn: () => productsService.getAllProductsLight(),
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
        enabled: enabled,
        refetchOnWindowFocus: false
    });

    // 2. Client-side search function
    const search = useCallback((term: string) => {
        if (!term || !allProducts) return EMPTY_ARRAY;

        const lowerTerm = term.toLowerCase();

        return allProducts.filter((product: any) => {
            const nameMatch = product.name?.toLowerCase().includes(lowerTerm);
            const skuMatch = product.sku?.toLowerCase().includes(lowerTerm);
            return nameMatch || skuMatch;
        }).sort((a: any, b: any) => {
            // Re-use smart sorting logic
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            const skuA = (a.sku || '').toLowerCase();
            const skuB = (b.sku || '').toLowerCase();

            // 1. Exact Name Match
            if (nameA === lowerTerm && nameB !== lowerTerm) return -1;
            if (nameB === lowerTerm && nameA !== lowerTerm) return 1;

            // 2. Exact SKU Match
            if (skuA === lowerTerm && skuB !== lowerTerm) return -1;
            if (skuB === lowerTerm && skuA !== lowerTerm) return 1;

            // 3. Name Starts With
            if (nameA.startsWith(lowerTerm) && !nameB.startsWith(lowerTerm)) return -1;
            if (!nameA.startsWith(lowerTerm) && nameB.startsWith(lowerTerm)) return 1;

            // 4. SKU Starts With
            if (skuA.startsWith(lowerTerm) && !skuB.startsWith(lowerTerm)) return -1;
            if (!skuA.startsWith(lowerTerm) && skuB.startsWith(lowerTerm)) return 1;

            return 0;
        }).slice(0, 20); // Limit results for performance
    }, [allProducts]);

    return {
        search,
        isLoading,
        isError,
        allProducts
    };
};
