import { useState, Fragment, lazy, Suspense, memo } from 'react';
import ProductListHeader from './ProductListHeader';
import ProductListTableSkeleton from './ProductListTableSkeleton';
import { validateProductId, validateProduct } from '../utils/securityHelpers';

// PERFORMANCE: Lazy load row components for code splitting
const ProductListRow = lazy(() => import('./ProductListRow'));
const ProductVariationsRow = lazy(() => import('./ProductVariationsRow'));

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
const ProductListTable = memo(({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, sortField, sortDirection, onSort, isLoading = false, selectedProductIds = new Set(), onSelectionChange }) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());

  const toggleExpand = (productId) => {
    // SECURITY: Validate product ID before processing
    const validId = validateProductId(productId);
    if (!validId) {
      console.warn('Invalid product ID for expand:', productId);
      return;
    }
    
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(validId)) {
      newExpanded.delete(validId);
    } else {
      newExpanded.add(validId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleSelectAll = (checked) => {
    if (onSelectionChange) {
      if (checked) {
        // SECURITY: Validate all product IDs before adding to selection
        const allIds = new Set(
          products
            .map(p => validateProductId(p.id))
            .filter(id => id !== null)
        );
        onSelectionChange(allIds);
      } else {
        onSelectionChange(new Set());
      }
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (onSelectionChange) {
      // SECURITY: Validate product ID before processing
      const validId = validateProductId(productId);
      if (!validId) {
        console.warn('Invalid product ID for selection:', productId);
        return;
      }
      
      const newSelection = new Set(selectedProductIds);
      if (checked) {
        newSelection.add(validId);
      } else {
        newSelection.delete(validId);
      }
      onSelectionChange(newSelection);
    }
  };

  // Show skeleton while loading initial data
  if (isLoading && products.length === 0) {
    return <ProductListTableSkeleton count={16} />;
  }

  // If no products, don't render table
  if (products.length === 0) {
    return null;
  }

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
            <Suspense fallback={null}>
              {products
                .filter(product => validateProduct(product)) // SECURITY: Filter out invalid products
                .map((product) => (
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
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
});

ProductListTable.displayName = 'ProductListTable';

export default ProductListTable;

