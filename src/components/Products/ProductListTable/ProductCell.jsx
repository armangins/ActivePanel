import { InboxOutlined as Package, DownOutlined as ChevronDownIcon, RightOutlined as ChevronRightIcon, LeftOutlined as ChevronLeftIcon } from '@ant-design/icons';
import { UserAvatar, OptimizedImage } from '../../ui';
import { validateImageUrl, sanitizeProductName, sanitizeAttributeValue } from '../utils/securityHelpers';

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
  // SECURITY: Validate and sanitize image URL
  const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
  const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;
  
  // SECURITY: Sanitize product name to prevent XSS
  const productName = sanitizeProductName(product.name || t('productName'));
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
    // SECURITY: Sanitize attribute names and values to prevent XSS
    return variationAttributes.map(attr => {
      const attrName = sanitizeAttributeValue(attr.name || '');
      const options = attr.options || [];
      if (options.length === 0) return null;

      // SECURITY: Sanitize each option value
      const sanitizedOptions = options.map(opt => sanitizeAttributeValue(String(opt)));
      const values = sanitizedOptions.join(' , ');
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
              // PERFORMANCE: Resize images for list view (48x48 for table cells)
              resize={true}
              width={48}
              height={48}
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

