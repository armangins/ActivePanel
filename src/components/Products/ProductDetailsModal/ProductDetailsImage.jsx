import { CubeIcon as Package } from '@heroicons/react/24/outline';

/**
 * ProductDetailsImage Component
 * 
 * Displays the product image in a square container.
 * Shows a placeholder icon if no image is available.
 * 
 * @param {Object} product - Product object
 */
const ProductDetailsImage = ({ product }) => {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].src : null;

  return (
    <div className="w-full md:w-1/3">
      <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-16 h-16 text-gray-300" />
        )}
      </div>
    </div>
  );
};

export default ProductDetailsImage;


