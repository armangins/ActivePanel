import { TrendingUp, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * MostSoldProducts Component
 * 
 * Displays a list of the most sold products based on total sales quantity.
 * 
 * @param {Array} products - Array of product objects with sales data
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const MostSoldProducts = ({ products, formatCurrency, t, isRTL }) => {
  if (!products || products.length === 0) {
    return (
      <p className={`text-gray-500 text-center py-8 ${'text-right'}`}>
        {t('noProducts')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => {
        const imageUrl = product.images?.[0]?.src || product.image?.src;
        const salesCount = product.total_sales || product.sold_quantity || 0;
        
        return (
          <div
            key={product.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ flexDirection: 'row-reverse' }}
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-500">#{index + 1}</span>
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="text-gray-400" size={24} />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium text-gray-900 truncate ${'text-right'}`}>
                {product.name}
              </h3>
              <div className={`flex items-center gap-2 mt-1 ${'flex-row-reverse justify-end'}`}>
                <TrendingUp size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {salesCount} {t('sold') || 'sold'}
                </span>
                {product.price && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-700">
                      {formatCurrency(parseFloat(product.price || 0))}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MostSoldProducts;


