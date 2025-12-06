/**
 * StateHandler Component
 * 
 * Reusable component for handling loading, error, and empty states.
 * Provides consistent UI across the application.
 * 
 * @param {Boolean} loading - Whether data is loading
 * @param {String|Object} error - Error message or error object
 * @param {Boolean} isEmpty - Whether data is empty
 * @param {String} emptyMessage - Custom empty state message
 * @param {String} emptyIcon - Icon type for empty state ('box', 'search', 'file', 'users', 'tag')
 * @param {Function} onRetry - Optional retry callback for error state
 * @param {ReactNode} children - Content to render when not in loading/error/empty state
 */
const StateHandler = ({
    loading = false,
    error = null,
    isEmpty = false,
    emptyMessage = 'No data found',
    emptyIcon = 'box',
    onRetry,
    children
}) => {
    // Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="animate-spin h-8 w-8 text-primary-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span className="text-sm text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';

        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 max-w-md text-center">
                    <svg
                        className="w-12 h-12 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div className="space-y-2">
                        <p className="text-red-600 font-medium">Error</p>
                        <p className="text-sm text-gray-600">{errorMessage}</p>
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Empty State
    if (isEmpty) {
        const icons = {
            box: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
            ),
            search: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            ),
            file: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            ),
            users: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
            ),
            tag: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
            ),
        };

        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="w-12 h-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {icons[emptyIcon] || icons.box}
                    </svg>
                    <p className="text-gray-500 text-sm">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    // Render children when no special state
    return <>{children}</>;
};

export default StateHandler;
