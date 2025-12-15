import { Spin, Result, Empty, Button } from 'antd';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

/**
 * StateHandler Component - Ant Design wrapper
 * 
 * Reusable component for handling loading, error, and empty states.
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
        return <LoadingState />;
    }

    // Error State
    if (error) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
        return <ErrorState error={errorMessage} onRetry={onRetry} />;
    }

    // Empty State
    if (isEmpty) {
        return <EmptyState message={emptyMessage} />;
    }

    // Render children when no special state
    return <>{children}</>;
};

export default StateHandler;
