import { useState } from 'react';
import ProductListHeader from './ProductListHeader';
import ProductListRow from './ProductListRow';

/**
 * ProductListTable Component
 * 
 * Main table component that displays products in a list/table format.
 * Handles action menu state.
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
const ProductListTable = ({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, sortField, sortDirection, onSort, isLoading = false }) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

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
          />
          <tbody className={`divide-y divide-gray-200 ${isLoading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
            {products.map((product) => (
              <ProductListRow
                key={product.id}
                product={product}
                isActionMenuOpen={actionMenuOpen === product.id}
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

