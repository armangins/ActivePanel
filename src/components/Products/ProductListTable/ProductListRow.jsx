import ProductCell from './ProductCell';
import CategoryCell from './CategoryCell';
import PriceCell from './PriceCell';
import SalePriceCell from './SalePriceCell';
import StockCell from './StockCell';
import ActionsCell from './ActionsCell';
import { validateProductId, sanitizeProductName } from '../utils/securityHelpers';

/**
 * ProductListRow Component
 * 
 * Individual table row representing a single product.
 * Handles row click to view product details.
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isActionMenuOpen - Whether the action menu is open for this product
 * @param {Function} onView - Callback when row is clicked
 * @param {Function} onEdit - Callback when edit action is triggered
 * @param {Function} onDelete - Callback when delete action is triggered
 * @param {Function} onActionMenuToggle - Callback to toggle action menu
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductListRow = ({
  product,
  isActionMenuOpen,
  onView,
  onEdit,
  onDelete,
  onActionMenuToggle,
  formatCurrency,
  isRTL,
  t,
  isExpanded,
  onToggleExpand,
  isSelected,
  onSelect
}) => {
  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onView && onView(product)}
    >
      {/* Checkbox Cell */}
      <td className="py-3 px-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            if (onSelect) {
              onSelect(product.id, e.target.checked);
            }
          }}
          className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500 focus:ring-2 cursor-pointer"
          aria-label={t('selectProduct') || `Select ${sanitizeProductName(product.name || '')}`}
        />
      </td>

      {/* Product Cell (Image + Name) */}
      <ProductCell
        product={product}
        isRTL={isRTL}
        t={t}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      {/* Category Cell */}
      <CategoryCell product={product} />

      {/* Price Cell */}
      <PriceCell product={product} formatCurrency={formatCurrency} />

      {/* Sale Price Cell */}
      <SalePriceCell product={product} formatCurrency={formatCurrency} />

      {/* Stock Status Cell */}
      <StockCell product={product} isRTL={isRTL} t={t} />

      {/* Actions Cell (Menu) */}
      <td className="w-16">
        <ActionsCell
          product={product}
          isActionMenuOpen={isActionMenuOpen}
          onActionMenuToggle={onActionMenuToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isRTL={isRTL}
          t={t}
        />
      </td>
    </tr>
  );
};

export default ProductListRow;

