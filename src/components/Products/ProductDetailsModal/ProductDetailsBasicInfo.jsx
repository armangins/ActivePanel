/**
 * ProductDetailsBasicInfo Component
 * 
 * Displays basic product information:
 * - Product name and SKU
 * - Description
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsBasicInfo = ({ product, isRTL, t }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
          {t('basicInfo') || 'Basic Info'}
        </h3>
        
        {/* Product Name and SKU */}
        <div className="space-y-3">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('productName')} <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={product.name || ''}
              readOnly
              className="input-field w-full"
              dir="rtl"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('sku')}
            </label>
            <input
              type="text"
              value={product.sku || ''}
              readOnly
              className="input-field w-full"
              dir="rtl"
            />
          </div>

          {/* Categories */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${'text-right'}`}>
              {t('category')}
            </label>
            {product.categories && product.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg bg-white min-h-[42px] justify-start">
                {product.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value="-"
                readOnly
                className="input-field w-full"
                dir="rtl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsBasicInfo;

