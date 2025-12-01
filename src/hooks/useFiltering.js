import { useMemo } from 'react';

/**
 * useFiltering Hook
 * 
 * Custom hook for client-side filtering logic.
 * 
 * @param {Array} items - Array of items to filter
 * @param {Object} filters - Filter configuration object
 * @param {string} filters.searchQuery - Search query string
 * @param {Function} filters.searchFields - Array of field names to search in
 * @param {Object} filters.category - Category filter (id or function)
 * @param {Object} filters.priceRange - Price range filter { min, max }
 * @param {Function} filters.customFilter - Custom filter function
 * @returns {Array} Filtered items
 */
const useFiltering = (items = [], filters = {}) => {
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    let result = [...items];

    // Search filter
    if (filters.searchQuery && filters.searchFields) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter((item) => {
        return filters.searchFields.some((field) => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(query);
        });
      });
    }

    // Category filter
    if (filters.category) {
      if (typeof filters.category === 'function') {
        result = result.filter(filters.category);
      } else if (filters.category.id) {
        result = result.filter((item) => {
          const categories = item.categories || [];
          return categories.some((cat) => cat.id === filters.category.id);
        });
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      result = result.filter((item) => {
        const price = parseFloat(item.price || item.regular_price || 0);
        if (min && price < min) return false;
        if (max && price > max) return false;
        return true;
      });
    }

    // Custom filter
    if (filters.customFilter && typeof filters.customFilter === 'function') {
      result = result.filter(filters.customFilter);
    }

    return result;
  }, [items, filters]);

  return filteredItems;
};

export default useFiltering;




