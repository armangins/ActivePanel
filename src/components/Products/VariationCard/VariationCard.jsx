import { memo } from 'react';
import { CubeIcon as Package } from '@heroicons/react/24/outline';
import { OptimizedImage } from '../../ui';

const VariationCard = memo(({
  variation,
  formatCurrency,
  isRTL,
  t
}) => {
  // Direct property access is faster than useMemo for simple values
  const imageUrl = variation.image?.src || null;
  const regularPrice = variation.regular_price || variation.price || null;
  const salePrice = variation.sale_price || null;

  const displayPrice = regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-';
  const displaySalePrice = salePrice ? formatCurrency(parseFloat(salePrice)) : null;

  const stockStatus = variation.stock_status || 'instock';

  // Get variation attributes (e.g., "Size: Large, Color: Red")
  const attributesText = variation.attributes?.length > 0
    ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
    : '';

  // Get variation name (use attributes text or variation name)
  const variationName = attributesText || variation.name || `Variation #${variation.id}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Variation Image */}
      <div className="w-full aspect-square flex-shrink-0 relative">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={variationName}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Variation Info */}
      <div className="p-2 flex flex-col flex-1 min-h-0">
        {/* Variation Name */}
        <div className="mb-1">
          <p className="text-xs font-semibold text-gray-900 line-clamp-1 text-right" title={variationName}>
            {variationName}
          </p>
        </div>

        {/* SKU */}
        {variation.sku && (
          <div className="mb-1">
            <p className="text-xs text-gray-600 text-right truncate">
              <span className="font-medium">{t('sku')}:</span> {variation.sku}
            </p>
          </div>
        )}

        {/* Price */}
        <div className="mb-1">
          <div className="flex items-center flex-row-reverse justify-end gap-1">
            {displaySalePrice ? (
              <>
                <p className="text-sm font-regular text-primary-500">
                  {displaySalePrice}
                </p>
                {regularPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {displayPrice}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm font-regular text-gray-900">
                {displayPrice}
              </p>
            )}
          </div>
        </div>

        {/* Stock */}
        <div className="mt-auto pt-1 border-t border-gray-200">
          <div className="flex items-center justify-end gap-2 flex-row-reverse">
            <span className="text-xs text-gray-600 text-right">
              {t('stock')}: <span className="font-semibold">{variation.stock_quantity ?? '-'}</span>
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stockStatus === 'instock' ? 'bg-green-500' : 'bg-orange-500'}`}
              title={stockStatus === 'instock' ? t('inStock') : t('outOfStock')}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

VariationCard.displayName = 'VariationCard';

export default VariationCard;

