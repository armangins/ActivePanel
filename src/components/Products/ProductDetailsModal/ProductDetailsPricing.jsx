
/**
 * ProductDetailsPricing Component
 * 
 * Displays pricing information:
 * - Regular price
 * - Sale price
 * - Stock status and quantity
 * 
 * @param {Object} product - Product object
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsPricing = ({ product, formatCurrency, isRTL, t }) => {
  const stockStatus = product.stock_status || 'instock';
  const regularPrice = product.regular_price || product.price || null;
  const salePrice = product.sale_price || null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
          {t('pricing') || 'Pricing'}
        </h3>
        
        <div className="space-y-3">
          {/* Regular Price */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('price')} <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={regularPrice ? formatCurrency(parseFloat(regularPrice)) : ''}
              readOnly
              className="input-field"
              dir="rtl"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('salePrice')}
            </label>
            <input
              type="text"
              value={salePrice ? formatCurrency(parseFloat(salePrice)) : ''}
              readOnly
              className="input-field"
              dir="rtl"
            />
          </div>

          {/* Stock Status */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('status')}
            </label>
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
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('stockQuantity')}
            </label>
            <input
              type="text"
              value={product.stock_quantity ?? '-'}
              readOnly
              className="input-field"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPricing;

