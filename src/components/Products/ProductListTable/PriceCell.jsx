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
  if (isVariable && product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
    // Use regular_price first, fall back to price (not sale_price)
    const prices = product.variations
      .map(v => parseFloat(v.regular_price || v.price || 0))
      .filter(p => p > 0);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const priceRange = minPrice === maxPrice
        ? formatCurrency(minPrice)
        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

      return (
        <td className="py-3 px-4 text-right">
          <span className="text-sm font-medium text-gray-900">
            {priceRange}
          </span>
        </td>
      );
    }
  }

  // Simple product pricing
  const hasSalePrice = product.sale_price && parseFloat(product.sale_price) > 0;
  const regularPriceValue = parseFloat(product.regular_price || product.price || 0);

  return (
    <td className="py-3 px-4 text-right">
      <span className={`text-sm font-medium ${hasSalePrice ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {formatCurrency(regularPriceValue)}
      </span>
    </td>
  );
};

export default PriceCell;

