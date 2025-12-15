import { useState } from 'react';
import { VariationsList } from '../../Variations';
import { DownOutlined as ChevronDownIcon, UpOutlined as ChevronUpIcon } from '@ant-design/icons';

/**
 * ProductDetailsOrganization Component
 * 
 * Displays variations for variable products using the VariationsList component inside an accordion.
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Array} variations - Array of variation objects (for variable products)
 * @param {Boolean} loadingVariations - Whether variations are loading
 * @param {String} variationsError - Error message if loading failed
 */
const ProductDetailsOrganization = ({
  product,
  isRTL,
  t,
  formatCurrency,
  variations = [],
  loadingVariations = false,
  variationsError = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const variationsCount = variations?.length || 0;

  // Only show for variable products
  if (product.type !== 'variable') return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        {/* Left Side (Text + Badge) */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">
            {t('variations') || 'Variations'}
          </span>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {variationsCount}
          </span>
        </div>

        {/* Right Side (Icon) */}
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <VariationsList
            variations={variations}
            loading={loadingVariations}
            error={variationsError}
            formatCurrency={formatCurrency}
            t={t}
            showActions={false}
            emptyMessage={t('noVariations') || 'No variations found'}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetailsOrganization;
