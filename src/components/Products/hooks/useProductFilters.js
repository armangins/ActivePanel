import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook to manage product filtering state and logic
 */
export const useProductFilters = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

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
