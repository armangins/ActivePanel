import VariationCard from '../../../VariationCard';

/**
 * ProductDetailsInfo Component
 * 
 * Displays basic product information including:
 * - Product name and SKU
 * - Stock status and quantity
 * - Regular price and sale price
 * - Variation cards (for variable products)
 * 
 * @param {Object} product - Product object
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Array} variations - Array of variation objects (for variable products)
 * @param {Boolean} loadingVariations - Whether variations are loading
 * @param {String} variationsError - Error message if loading failed
 */
const ProductDetailsInfo = ({ product, formatCurrency, isRTL, t, variations = [], loadingVariations = false, variationsError = null }) => {
  const stockStatus = product.stock_status || 'instock';
  // Use only regular_price - do not use 'price' field as it may include tax calculations
  const regularPrice = product.regular_price || null;
  const salePrice = product.sale_price || null;

  return (
    <div className="flex-1 space-y-3">
      {/* Product Name and SKU */}
      <div className={`flex items-center ${'flex-row-reverse'} gap-3`}>
        <h3 className="text-xl font-semibold text-gray-900">
          {product.name}
        </h3>
        {product.sku && (
          <p className="text-sm text-gray-500">
            {t('sku')}: {product.sku}
          </p>
        )}
      </div>

      {/* Product Details Grid */}
      <div className="flex flex-wrap gap-4 text-sm">
        {/* Stock Status */}
        <div>
          <p className="font-medium text-gray-700">{t('status')}</p>
          {stockStatus === 'instock' ? (
            <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
              <span className="text-sm font-medium text-gray-700">
                {t('inStock')}
              </span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>
          ) : (
            <span className="text-sm font-medium text-orange-600">
              {t('outOfStock')}
            </span>
          )}
        </div>

        {/* Stock Quantity */}
        <div>
          <p className="font-medium text-gray-700">
            {t('stockQuantity')}
          </p>
          <p className="text-gray-800">
            {product.stock_quantity ?? '-'}
          </p>
        </div>

        {/* Regular Price */}
        <div>
          <p className="font-medium text-gray-700">
            {t('regularPrice')}
          </p>
          <p className="text-gray-800">
            {regularPrice
              ? formatCurrency(parseFloat(regularPrice))
              : '-'}
          </p>
        </div>

        {/* Sale Price */}
        <div>
          <p className="font-medium text-gray-700">{t('salePrice')}</p>
          <p className="text-gray-800">
            {salePrice
              ? formatCurrency(parseFloat(salePrice))
              : '-'}
          </p>
        </div>
      </div>

      {/* Variations Section - Only for Variable Products */}
      {product.type === 'variable' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className={`text-md font-semibold text-gray-900 mb-3 ${'text-right'}`}>
            {t('variations')} ({variations.length})
          </h4>

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
          {!loadingVariations && !variationsError && variations.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">{t('noVariations')}</p>
            </div>
          )}

          {/* Variations Grid */}
          {!loadingVariations && !variationsError && variations.length > 0 && (
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${'rtl'}`}>
              {variations.map((variation) => (
                <VariationCard
                  key={variation.id}
                  variation={variation}
                  formatCurrency={formatCurrency}
                  isRTL={isRTL}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsInfo;

