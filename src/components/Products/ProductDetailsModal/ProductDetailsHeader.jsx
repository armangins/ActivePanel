import { X } from 'lucide-react';

/**
 * ProductDetailsHeader Component
 * 
 * Header section of the product details modal.
 * Displays the title, "View on Site" button, and close button.
 * 
 * @param {Object} product - Product object
 * @param {Function} onClose - Callback to close the modal
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsHeader = ({ product, onClose, isRTL, t }) => {
  return (
    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
      <h2
        className={`text-2xl font-bold text-gray-900 ${
          'text-right'
        }`}
      >
        {t('productDetails') || t('products')}
      </h2>
      <div className={`flex items-center ${'flex-row-reverse'} gap-3`}>
        {product.permalink && (
          <a
            href={product.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            {t('viewOnSite')}
          </a>
        )}
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsHeader;


