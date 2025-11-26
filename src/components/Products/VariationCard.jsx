import { Package } from 'lucide-react';

const VariationCard = ({ 
  variation, 
  formatCurrency,
  isRTL,
  t
}) => {
  const imageUrl = variation.image && variation.image.src ? variation.image.src : null;
  
  const regularPrice = variation.regular_price || variation.price || null;
  const salePrice = variation.sale_price || null;
  
  const displayPrice = regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-';
  const displaySalePrice = salePrice ? formatCurrency(parseFloat(salePrice)) : null;
  
  const discountPercentage = regularPrice && salePrice
    ? Math.round(((parseFloat(regularPrice) - parseFloat(salePrice)) / parseFloat(regularPrice)) * 100)
    : 0;

  const stockStatus = variation.stock_status || 'instock';
  const stockStatusLabel = stockStatus === 'instock' ? t('inStock') : t('outOfStock');
  
  // Get variation attributes (e.g., "Size: Large, Color: Red")
  const attributesText = variation.attributes && variation.attributes.length > 0
    ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
    : '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Variation Image */}
      <div className="w-full aspect-square">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={variation.name || attributesText}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="text-gray-400" size={32} />
          </div>
        )}
      </div>

      {/* Variation Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Attributes */}
        {attributesText && (
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-700 line-clamp-2 text-left">
              {attributesText}
            </p>
          </div>
        )}

        {/* SKU */}
        {variation.sku && (
          <p className="text-xs text-gray-500 mb-2 text-left">
            {t('sku')}: {variation.sku}
          </p>
        )}

        {/* Stock Status */}
        <div className="mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            stockStatus === 'instock' 
              ? 'text-primary-500' 
              : 'bg-red-100 text-red-800'
          }`}
          style={stockStatus === 'instock' ? { backgroundColor: '#EBF3FF' } : {}}
          >
            {stockStatusLabel}
          </span>
        </div>

        {/* Prices */}
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-end gap-2 pt-2 border-t border-gray-200 flex-wrap`}>
          {displaySalePrice ? (
            <>
              <p className="text-lg font-bold text-primary-500">
                {displaySalePrice}
              </p>
              {regularPrice && (
                <p className="text-xs text-gray-400 line-through">
                  {displayPrice}
                </p>
              )}
              {discountPercentage > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded">
                  {discountPercentage}%
                </span>
              )}
            </>
          ) : (
            <p className="text-lg font-bold text-gray-900">
              {displayPrice}
            </p>
          )}
        </div>

        {/* Stock Quantity */}
        {variation.stock_quantity !== null && variation.stock_quantity !== undefined && (
          <p className="text-xs text-gray-500 mt-2 text-left">
            {t('stock')}: {variation.stock_quantity}
          </p>
        )}
      </div>
    </div>
  );
};

export default VariationCard;

