import { useMemo } from 'react';

/**
 * Custom hook to handle product sorting
 */
export const useProductSort = (products, sortField, sortDirection) => {
    return useMemo(() => {
        if (!sortField) return products;

        return [...products].sort((a, b) => {
            if (sortField === 'name') {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return sortDirection === 'asc'
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            }

            if (sortField === 'price') {
                const priceA = parseFloat(a.price || a.regular_price || 0);
                const priceB = parseFloat(b.price || b.regular_price || 0);
                return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
            }

            return 0;
        });
    }, [products, sortField, sortDirection]);
};
