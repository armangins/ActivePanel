/**
 * Component to display loading indicators for infinite scroll
 */
export const LoadMoreIndicator = ({
    hasNextPage,
    isFetchingNextPage,
    allProducts,
    totalProducts,
    onLoadMore,
    t
}) => {
    if (!hasNextPage && allProducts.length > 0) {
        return (
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                        {t('allProductsLoaded') || 'All products loaded'} ({totalProducts})
                    </span>
                </div>
            </div>
        );
    }

    if (!hasNextPage) {
        return null;
    }

    return (
        <div className="mt-8 flex flex-col items-center gap-3">
            {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">{t('loadingMore') || 'Loading more products...'}</span>
                </div>
            ) : (
                <button
                    onClick={onLoadMore}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
                >
                    {t('loadMore') || 'Load More Products'}
                </button>
            )}
            <div className="text-xs text-gray-500">
                {t('showing')} {allProducts.length} {t('of')} {totalProducts}
            </div>
        </div>
    );
};
