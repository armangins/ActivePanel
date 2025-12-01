/**
 * SalePriceCell Component
 * 
 * Displays the product sale price if available.
 * Shows "-" if no sale price exists.
 * 
 * @param {Object} product - Product object
 * @param {Function} formatCurrency - Function to format currency values
 */
const SalePriceCell = ({ product, formatCurrency }) => {
  const hasSalePrice = product.sale_price && parseFloat(product.sale_price) > 0;
  const salePriceValue = hasSalePrice ? parseFloat(product.sale_price) : null;

  return (
    <td className="py-3 px-4 text-right">
      {salePriceValue ? (
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(salePriceValue)}
        </span>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )}
    </td>
  );
};

export default SalePriceCell;





