import { XMarkIcon as X, CubeIcon as Package, ExclamationTriangleIcon as AlertTriangle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * LowStockSidebar Component
 * 
 * Sidebar that displays all products with low stock or out of stock
 * 
 * @param {boolean} isOpen - Whether the sidebar is open
 * @param {Function} onClose - Callback to close the sidebar
 * @param {Array} products - Array of low stock products
 * @param {Function} formatCurrency - Function to format currency values
 */
const LowStockSidebar = ({ isOpen, onClose, products = [], formatCurrency }) => {
  const { t } = useLanguage();

  const getStockStatus = (product) => {
    if (product.stock_status === 'outofstock') {
      return { text: t('outOfStock') || 'אזל מהמלאי', color: 'text-orange-600', bg: 'bg-orange-50' };
    }
    if (product.manage_stock && product.stock_quantity !== null) {
      return { text: `${product.stock_quantity} ${t('inStock') || 'במלאי'}`, color: 'text-orange-600', bg: 'bg-orange-50' };
    }
    return { text: t('lowStock') || 'מלאי נמוך', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto' 
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('lowStockProducts') || 'מוצרים במלאי נמוך'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {products.length} {t('products') || 'מוצרים'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('close') || 'סגור'}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Products List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-right">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {t('noLowStockProducts') || 'אין מוצרים במלאי נמוך'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const imageUrl = product.images && product.images.length > 0 
                  ? product.images[0].src 
                  : '/placeholder-product.png';

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.png';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color} font-medium`}>
                          {stockStatus.text}
                        </span>
                        {product.sku && (
                          <span className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>
                      {product.price && (
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LowStockSidebar;

