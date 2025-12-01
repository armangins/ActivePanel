/**
 * StockCell Component
 * 
 * Displays the product stock status with appropriate styling.
 * In Stock: Text with little green dot
 * Out of Stock: Red text
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const StockCell = ({ product, isRTL, t }) => {
  const stockStatus = product.stock_status || 'instock';
  const stockStatusLabel = stockStatus === 'instock' ? t('inStock') : t('outOfStock');

  return (
    <td className="py-3 px-4 text-right">
      {stockStatus === 'instock' ? (
        <div className="flex items-center gap-2 flex-row-reverse justify-end">
          <span className="text-sm font-medium text-gray-700">
            {stockStatusLabel}
          </span>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </div>
      ) : (
        <span className="text-sm font-medium text-orange-600">
          {stockStatusLabel}
        </span>
      )}
    </td>
  );
};

export default StockCell;

