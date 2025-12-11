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
    // Use only regular_price - do not use 'price' field as it may include tax calculations
    // The 'price' field in WooCommerce can be modified by tax settings, so we stick to regular_price
    const prices = product.variations
      .map(v => {
        // Only use regular_price to avoid tax calculation discrepancies
        const priceValue = v.regular_price || 0;
        return parseFloat(priceValue);
      })
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
  // Use only regular_price - do not use 'price' field as it may include tax calculations
  const hasSalePrice = product.sale_price && parseFloat(product.sale_price) > 0;
  const regularPriceValue = parseFloat(product.regular_price || 0);

  return (
    <td className="py-3 px-4 text-right">
      <span className={`text-sm font-medium ${hasSalePrice ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {formatCurrency(regularPriceValue)}
      </span>
    </td>
  );
};

export default PriceCell;

