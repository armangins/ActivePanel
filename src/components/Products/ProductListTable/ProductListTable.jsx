import { useState, Fragment } from 'react';
import ProductListHeader from './ProductListHeader';
import ProductListRow from './ProductListRow';
import ProductVariationsRow from './ProductVariationsRow';

/**
 * ProductListTable Component
 * 
 * Main table component that displays products in a list/table format.
 * Handles action menu state and product selection.
 * 
 * @param {Array} products - Array of product objects to display
 * @param {Function} onView - Callback when a product row is clicked
 * @param {Function} onEdit - Callback when edit action is triggered
 * @param {Function} onDelete - Callback when delete action is triggered
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {String} sortField - Current sort field ('name' or 'price')
 * @param {String} sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is triggered
 * @param {Set} selectedProductIds - Set of selected product IDs (controlled)
 * @param {Function} onSelectionChange - Callback when selection changes
 */
const ProductListTable = ({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, sortField, sortDirection, onSort, isLoading = false, selectedProductIds = new Set(), onSelectionChange }) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  const toggleExpand = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleSelectAll = (checked) => {
    if (onSelectionChange) {
      if (checked) {
        const allIds = new Set(products.map(p => p.id));
        onSelectionChange(allIds);
      } else {
        onSelectionChange(new Set());
      }
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (onSelectionChange) {
      const newSelection = new Set(selectedProductIds);
      if (checked) {
        newSelection.add(productId);
      } else {
        newSelection.delete(productId);
      }
      onSelectionChange(newSelection);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <ProductListHeader
            products={products}
            isRTL={isRTL}
            t={t}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            selectedProductIds={selectedProductIds}
            onSelectAll={handleSelectAll}
          />
          <tbody className={`divide-y divide-gray-200 ${isLoading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
            {products.map((product) => (
              <Fragment key={product.id}>
                <ProductListRow
                  product={product}
                  isActionMenuOpen={actionMenuOpen === product.id}
                  isExpanded={expandedProducts.has(product.id)}
                  onToggleExpand={() => toggleExpand(product.id)}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onActionMenuToggle={(productId) => setActionMenuOpen(actionMenuOpen === productId ? null : productId)}
                  formatCurrency={formatCurrency}
                  isRTL={isRTL}
                  t={t}
                  isSelected={selectedProductIds.has(product.id)}
                  onSelect={handleSelectProduct}
                />
                {expandedProducts.has(product.id) && (
                  <ProductVariationsRow
                    product={product}
                    formatCurrency={formatCurrency}
                    t={t}
                    isRTL={isRTL}
                  />
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListTable;

