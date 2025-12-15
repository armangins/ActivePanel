import { InboxOutlined as Package } from '@ant-design/icons';
import { Button } from '../../ui';

/**
 * VariationCard Component
 * 
 * Displays a single product variation as a card with image, attributes, price, and stock status.
 * 
 * @param {Object} variation - Variation object
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {Function} onEdit - Optional callback when edit is clicked
 * @param {Function} onDelete - Optional callback when delete is clicked
 * @param {Boolean} showActions - Whether to show edit/delete actions
 */
const VariationCard = ({
    variation,
    formatCurrency,
    t,
    onEdit,
    onDelete,
    showActions = false
}) => {
    const imageUrl = variation.image?.src || null;
    const attributesText = variation.attributes?.length > 0
        ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
        : '';
    const regularPrice = variation.regular_price || variation.price || null;
    const salePrice = variation.sale_price || null;
    const displayPrice = salePrice
        ? formatCurrency(parseFloat(salePrice))
        : (regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-');
    const stockStatus = variation.stock_status || 'instock';

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-row w-full shadow-sm hover:shadow-md transition-shadow">
            {/* Variation Image */}
            <div className="w-32 h-full min-h-[96px] bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={attributesText || variation.name || 'Variation'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                )}
            </div>

            {/* Variation Info */}
            <div className="p-3 flex flex-col gap-2 flex-1 justify-center items-start text-right">
                {/* Attributes */}
                {attributesText && (
                    <p className="text-sm font-medium text-gray-800 text-right">
                        {attributesText}
                    </p>
                )}

                {/* Price and Stock Status Row */}
                <div className="flex items-center flex-row-reverse gap-3 flex-wrap justify-end">
                    {/* Price */}
                    <div className="flex items-center flex-row-reverse gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {displayPrice}
                        </span>
                        {salePrice && regularPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatCurrency(parseFloat(regularPrice))}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    {stockStatus === 'instock' ? (
                        <div className="flex items-center gap-1.5 flex-row-reverse">
                            <span className="text-xs font-medium text-gray-700">
                                {t('inStock')}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-orange-600">
                            {t('outOfStock')}
                        </span>
                    )}
                </div>

                {/* Actions */}
                {showActions && (onEdit || onDelete) && (
                    <div className="flex gap-2 mt-2 flex-row-reverse">
                        {onEdit && (
                            <Button
                                onClick={() => onEdit(variation)}
                                variant="secondary"
                                size="sm"
                                className="text-xs"
                            >
                                {t('edit')}
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                onClick={() => onDelete(variation)}
                                variant="danger"
                                size="sm"
                                className="text-xs"
                            >
                                {t('delete')}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VariationCard;

