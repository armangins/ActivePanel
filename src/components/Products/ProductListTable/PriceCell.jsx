/**
 * PriceCell Component
 * 
 * Displays the product regular price.
 * Shows regular price with strikethrough if sale price exists,
 * otherwise shows only regular price.
 * 
 * @param {Object} product - Product object
 * @param {Function} formatCurrency - Function to format currency values
 */
const PriceCell = ({ product, formatCurrency }) => {
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

