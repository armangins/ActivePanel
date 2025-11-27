import { Package } from 'lucide-react';

/**
 * ProductCell Component
 * 
 * Displays product image and name in a table cell.
 * Image appears first, then product name (right-aligned in RTL).
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductCell = ({ product, isRTL, t }) => {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
  const productName = product.name || t('productName');

  return (
    <td className="py-3 px-4 text-right">
      <div className={`flex items-center ${'justify-start'} gap-3`}>
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="text-gray-400" size={20} />
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-900">{productName}</span>
      </div>
    </td>
  );
};

export default ProductCell;

