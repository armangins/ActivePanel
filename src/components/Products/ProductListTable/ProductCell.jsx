import { CubeIcon as Package, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { UserAvatar, OptimizedImage } from '../../ui';

/**
 * ProductCell Component
 * 
 * Displays product image, name, and variation details in a table cell.
 * Image appears first, then product name with variations below (right-aligned in RTL).
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Boolean} isExpanded - Whether the row is expanded
 * @param {Function} onToggleExpand - Callback to toggle expansion
 */
const ProductCell = ({ product, isRTL, t, isExpanded, onToggleExpand }) => {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
  const productName = product.name || t('productName');
  const isVariable = product.type === 'variable';

  // Extract variation details from attributes
  const getVariationDetails = () => {
    if (!product.attributes || !Array.isArray(product.attributes)) {
      return null;
    }

    // Find attributes that are used for variations
    const variationAttributes = product.attributes.filter(attr => attr.variation === true);

    if (variationAttributes.length === 0) {
      return null;
    }

    // Format attributes as "AttributeName : value1 , value2 , value3"
    return variationAttributes.map(attr => {
      const attrName = attr.name || '';
      const options = attr.options || [];
      if (options.length === 0) return null;

      const values = options.join(' , ');
      return `${attrName} : ${values}`;
    }).filter(Boolean);
  };

  const variationDetails = getVariationDetails();

  return (
    <td className="py-3 px-4 text-right">
      <div className={`flex items-start ${'justify-start'} gap-3`}>
        {isVariable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand && onToggleExpand();
            }}
            className="mt-3 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title={isExpanded ? t('collapse') || 'Collapse' : t('expand') || 'Expand'}
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              isRTL ? <ChevronLeftIcon className="w-4 h-4 text-gray-500" /> : <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}

        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 mb-1">{productName}</div>
          {variationDetails && variationDetails.length > 0 && (
            <div className="space-y-1">
              {variationDetails.map((detail, index) => (
                <div key={index} className="text-xs text-gray-500">
                  {detail}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </td>
  );
};

export default ProductCell;

