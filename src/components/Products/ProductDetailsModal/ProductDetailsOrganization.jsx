import { CubeIcon as Package } from '@heroicons/react/24/outline';

/**
 * ProductDetailsOrganization Component
 * 
 * Displays variations for variable products as small cards/chips with images.
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Array} variations - Array of variation objects (for variable products)
 * @param {Boolean} loadingVariations - Whether variations are loading
 * @param {String} variationsError - Error message if loading failed
 */
const ProductDetailsOrganization = ({ product, isRTL, t, formatCurrency, variations = [], loadingVariations = false, variationsError = null }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 text-right" style={{ textAlign: 'right' }}>
          {t('variations') || 'Variations'}
        </h3>
        
        {/* Loading State */}
        {loadingVariations && (
          <div className="text-center py-4">
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        )}

        {/* Error State */}
        {variationsError && (
          <div className="text-center py-4">
            <p className="text-orange-500">{variationsError}</p>
          </div>
        )}

        {/* Empty State */}
        {!loadingVariations && !variationsError && (product.type !== 'variable' || variations.length === 0) && (
          <div className="text-center py-4">
            <p className="text-gray-500">{product.type === 'variable' ? t('noVariations') : '-'}</p>
          </div>
        )}

        {/* Variations as Small Cards/Chips with Images */}
        {!loadingVariations && !variationsError && product.type === 'variable' && variations.length > 0 && (
          <div className="flex flex-col gap-2 items-start">
            {variations.map((variation) => {
              const imageUrl = variation.image && variation.image.src ? variation.image.src : null;
              const attributesText = variation.attributes && variation.attributes.length > 0
                ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
                : '';
              const regularPrice = variation.regular_price || variation.price || null;
              const salePrice = variation.sale_price || null;
              const displayPrice = salePrice ? formatCurrency(parseFloat(salePrice)) : (regularPrice ? formatCurrency(parseFloat(regularPrice)) : '-');
              const stockStatus = variation.stock_status || 'instock';

              return (
                <div
                  key={variation.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-row w-full shadow-sm hover:shadow-md transition-shadow"
                >
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
                  <div className="p-3 flex flex-col gap-2 flex-1 justify-center items-end text-right">
                    {/* Attributes */}
                    {attributesText && (
                      <p className="text-sm font-medium text-gray-800 text-right">
                        {attributesText}
                      </p>
                    )}
                    
                    {/* Price and Stock Status Row */}
                    <div className="flex items-center flex-row-reverse gap-3 flex-wrap justify-end">
                      {/* Price */}
                      <div className={`flex items-center flex-row-reverse gap-2`}>
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
                        <div className={`flex items-center gap-1.5 ${'flex-row-reverse'}`}>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsOrganization;

