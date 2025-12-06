import VariationCard from '../VariationCard';
import { StateHandler } from '../../ui';

/**
 * VariationsList Component
 * 
 * Displays a list of product variations with loading, error, and empty states.
 * 
 * @param {Array} variations - Array of variation objects
 * @param {Boolean} loading - Whether variations are loading
 * @param {String} error - Error message if loading failed
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {Function} onEdit - Optional callback when edit is clicked
 * @param {Function} onDelete - Optional callback when delete is clicked
 * @param {Boolean} showActions - Whether to show edit/delete actions
 * @param {String} emptyMessage - Custom empty state message
 */
const VariationsList = ({
    variations = [],
    loading = false,
    error = null,
    formatCurrency,
    t,
    onEdit,
    onDelete,
    showActions = false,
    emptyMessage
}) => {
    return (
        <StateHandler
            loading={loading}
            error={error}
            isEmpty={variations.length === 0}
            emptyMessage={emptyMessage || t('noVariations') || 'No variations found'}
            emptyIcon="box"
        >
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                        {variations.length} {variations.length === 1 ? t('variation') : t('variations')}
                    </span>
                </div>

                {/* List */}
                <div className="flex flex-col gap-2">
                    {variations.map((variation) => (
                        <VariationCard
                            key={variation.id}
                            variation={variation}
                            formatCurrency={formatCurrency}
                            t={t}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            showActions={showActions}
                        />
                    ))}
                </div>
            </div>
        </StateHandler>
    );
};

export default VariationsList;
