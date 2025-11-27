import { useState } from 'react';
import ProductListHeader from './ProductListHeader';
import ProductListRow from './ProductListRow';

/**
 * ProductListTable Component
 * 
 * Main table component that displays products in a list/table format.
 * Handles product selection state and action menu state.
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
 */
const ProductListTable = ({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, sortField, sortDirection, onSort }) => {
  // State for managing selected products (for bulk operations)
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // State for managing which product's action menu is open
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  /**
   * Toggle selection for a single product
   */
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  /**
   * Toggle selection for all products
   */
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <ProductListHeader
            products={products}
            selectedProducts={selectedProducts}
            onSelectAll={toggleSelectAll}
            isRTL={isRTL}
            t={t}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <ProductListRow
                key={product.id}
                product={product}
                isSelected={selectedProducts.includes(product.id)}
                isActionMenuOpen={actionMenuOpen === product.id}
                onSelect={() => toggleProductSelection(product.id)}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onActionMenuToggle={(productId) => setActionMenuOpen(actionMenuOpen === productId ? null : productId)}
                formatCurrency={formatCurrency}
                isRTL={isRTL}
                t={t}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListTable;

