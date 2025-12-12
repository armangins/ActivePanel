import { useState, useCallback } from 'react';

/**
 * usePagination Hook
 * 
 * Custom hook for managing pagination state and logic.
 * 
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialPerPage - Items per page (default: 20)
 * @returns {Object} Pagination state and handlers
 */
const usePagination = (initialPage = 1, initialPerPage = 20) => {
  const [page, setPage] = useState(initialPage);
  const [perPage] = useState(initialPerPage);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(false);
    setLoadingMore(false);
  }, [initialPage]);

  return {
    page,
    perPage,
    hasMore,
    loadingMore,
    setPage,
    setHasMore,
    setLoadingMore,
    goToPage,
    nextPage,
    reset,
  };
};

export default usePagination;









