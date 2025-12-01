import { memo, useMemo } from 'react';
import { CubeIcon as Package } from '@heroicons/react/24/outline';

const VariationCard = memo(({ 
  variation, 
  formatCurrency,
  isRTL,
  t
}) => {
  const imageUrl = useMemo(() => 
    variation.image && variation.image.src ? variation.image.src : null,
    [variation.image]
  );
  
  const regularPrice = useMemo(() => 
    variation.regular_price || variation.price || null,
    [variation.regular_price, variation.price]
  );
  
  const salePrice = useMemo(() => 
    variation.sale_price || null,
    [variation.sale_price]
  );
  
  const displayPrice = useMemo(() => 
    regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-',
    [regularPrice, formatCurrency]
  );
  
  const displaySalePrice = useMemo(() => 
    salePrice ? formatCurrency(parseFloat(salePrice)) : null,
    [salePrice, formatCurrency]
  );
  
  const discountPercentage = useMemo(() => 
    regularPrice && salePrice
      ? Math.round(((parseFloat(regularPrice) - parseFloat(salePrice)) / parseFloat(regularPrice)) * 100)
      : 0,
    [regularPrice, salePrice]
  );

  const stockStatus = useMemo(() => 
    variation.stock_status || 'instock',
    [variation.stock_status]
  );
  
  const stockStatusLabel = useMemo(() => 
    stockStatus === 'instock' ? t('inStock') : t('outOfStock'),
    [stockStatus, t]
  );
  
  // Get variation attributes (e.g., "Size: Large, Color: Red")
  const attributesText = useMemo(() => 
    variation.attributes && variation.attributes.length > 0
      ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
      : '',
    [variation.attributes]
  );

  // Get variation name (use attributes text or variation name)
  const variationName = useMemo(() => 
    attributesText || variation.name || `Variation #${variation.id}`,
    [attributesText, variation.name, variation.id]
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Variation Image */}
      <div className="w-full aspect-square flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={variationName}
            className="w-full h-full object-cover"
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
          <p className="text-xs font-semibold text-gray-900 line-clamp-1 text-right">
            {variationName}
          </p>
        </div>

        {/* SKU */}
        {variation.sku && (
          <div className="mb-1">
            <p className="text-xs text-gray-600 text-right">
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
              {t('stock')}: <span className="font-semibold">{variation.stock_quantity !== null && variation.stock_quantity !== undefined ? variation.stock_quantity : '-'}</span>
            </span>
            {stockStatus === 'instock' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

VariationCard.displayName = 'VariationCard';

export default VariationCard;

