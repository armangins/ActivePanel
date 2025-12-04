import { Button } from '../../ui';
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
        className={`text-2xl font-bold text-gray-900 ${'text-right'
          }`}
      >
        {t('productDetails') || t('products')}
      </h2>
      <div className={`flex items-center ${'flex-row-reverse'} gap-3`}>
        {product.permalink && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(product.permalink, '_blank')}
          >
            {t('viewOnSite')}
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailsHeader;


