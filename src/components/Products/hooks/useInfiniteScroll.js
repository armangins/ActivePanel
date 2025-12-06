import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle infinite scroll with optimized performance
 */
export const useInfiniteScroll = ({
    hasNextPage,
    isFetchingNextPage,
    loading,
    fetchNextPage
}) => {
    const isFetchingRef = useRef(false);

    const handleScroll = useCallback((e) => {
        if (isFetchingRef.current || !hasNextPage || isFetchingNextPage || loading) {
            return;
        }

        const container = e?.target || document.querySelector('main');
        if (!container) return;

        const scrollPosition = container.scrollTop + container.clientHeight;
        const totalHeight = container.scrollHeight;
        const distanceFromBottom = totalHeight - scrollPosition;

        // Trigger when within 200px of bottom
        if (distanceFromBottom <= 200) {
            isFetchingRef.current = true;
            fetchNextPage().finally(() => {
                // Reset after a short delay to prevent rapid successive calls
                setTimeout(() => {
                    isFetchingRef.current = false;
                }, 500);
            });
        }
    }, [hasNextPage, isFetchingNextPage, loading, fetchNextPage]);

    useEffect(() => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (mainContainer) {
                mainContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    const handleLoadMore = () => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    };

    return { handleLoadMore };
};
