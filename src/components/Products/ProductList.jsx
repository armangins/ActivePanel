import ProductListTable from './ProductListTable/ProductListTable';

/**
 * ProductList Component
 * 
 * Main wrapper component for the product list view.
 * Renders the table with all products.
 * 
 * @param {Array} products - Array of product objects to display
 * @param {Function} onView - Callback when a product is viewed
 * @param {Function} onEdit - Callback when a product is edited
 * @param {Function} onDelete - Callback when a product is deleted
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {String} sortField - Current sort field ('name' or 'price')
 * @param {String} sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} onSort - Callback when sort is triggered
 */
const ProductList = ({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, sortField, sortDirection, onSort }) => {
  return (
    <ProductListTable
      products={products}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      formatCurrency={formatCurrency}
      isRTL={isRTL}
      t={t}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
    />
  );
};

export default ProductList;
