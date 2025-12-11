import { calculateVariationPriceRange, formatPriceRange, getRegularPrice, hasSalePrice } from './utils/priceHelpers';

/**
 * PriceCell Component
 * 
 * Displays the product regular price or price range for variable products.
 * Shows regular price with strikethrough if sale price exists,
 * otherwise shows only regular price or price range.
 * 
 * @param {Object} product - Product object
 * @param {Function} formatCurrency - Function to format currency values
 */
const PriceCell = ({ product, formatCurrency }) => {
  const isVariable = product.type === 'variable';

  // For variable products, calculate price range from variations
  if (isVariable && product.variations) {
    const priceRange = calculateVariationPriceRange(product.variations);
    
    if (priceRange) {
      return (
        <td className="py-3 px-4 text-right">
          <span className="text-sm font-medium text-gray-900">
            {formatPriceRange(priceRange.minPrice, priceRange.maxPrice, formatCurrency)}
          </span>
        </td>
      );
    }
  }

  // Simple product pricing
  // Use only regular_price - do not use 'price' field as it may include tax calculations
  const regularPriceValue = getRegularPrice(product);
  const hasSale = hasSalePrice(product);

  return (
    <td className="py-3 px-4 text-right">
      <span className={`text-sm font-medium ${hasSale ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {formatCurrency(regularPriceValue)}
      </span>
    </td>
  );
};

export default PriceCell;

