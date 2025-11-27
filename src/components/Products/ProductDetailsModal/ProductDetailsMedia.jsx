import { Package } from 'lucide-react';

/**
 * ProductDetailsMedia Component
 * 
 * Displays product media (image).
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsMedia = ({ product, isRTL, t }) => {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].src : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
          {t('media') || 'Media'}
        </h3>
        <div className="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center aspect-square">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="text-gray-300" size={64} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsMedia;


