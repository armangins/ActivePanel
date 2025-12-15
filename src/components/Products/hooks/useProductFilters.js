import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook to manage product filtering state and logic
 */
export const useProductFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL params
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || '';
    const initialMinPrice = searchParams.get('min_price') || '';
    const initialMaxPrice = searchParams.get('max_price') || '';

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

    // Sync state with URL params when they change externally (e.g. from Header)
    useEffect(() => {
        const currentSearch = searchParams.get('search') || '';
        if (currentSearch !== searchQuery) {
            setSearchQuery(currentSearch);
            // PERFORMANCE: If the update comes from URL, update debounced value immediately
            // This prevents double-debounce delay when searching from Header
            setDebouncedSearchQuery(currentSearch);
        }
    }, [searchParams]);

    // Update URL params when filters change
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);

        if (debouncedSearchQuery) {
            newParams.set('search', debouncedSearchQuery);
        } else {
            newParams.delete('search');
        }

        if (selectedCategory) {
            newParams.set('category', selectedCategory);
        } else {
            newParams.delete('category');
        }

        if (minPrice) {
            newParams.set('min_price', minPrice);
        } else {
            newParams.delete('min_price');
        }

        if (maxPrice) {
            newParams.set('max_price', maxPrice);
        } else {
            newParams.delete('max_price');
        }

        setSearchParams(newParams, { replace: true });
    }, [debouncedSearchQuery, selectedCategory, minPrice, maxPrice]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Calculate filter metadata
    const filterMetadata = useMemo(() => {
        const hasFilters = !!(selectedCategory || minPrice || maxPrice || searchQuery);
        const filterCount = [selectedCategory, minPrice, maxPrice, searchQuery].filter(Boolean).length;

        return {
            hasActiveFilters: hasFilters,
            activeFilterCount: filterCount,
        };
    }, [selectedCategory, minPrice, maxPrice, searchQuery]);

    const clearFilters = () => {
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSearchQuery('');
        setDebouncedSearchQuery(''); // Clear this too immediately
    };

    return {
        // State
        searchQuery,
        debouncedSearchQuery,
        selectedCategory,
        minPrice,
        maxPrice,

        // Setters
        setSearchQuery,
        setSelectedCategory,
        setMinPrice,
        setMaxPrice,

        // Computed
        ...filterMetadata,

        // Actions
        clearFilters,
    };
};
