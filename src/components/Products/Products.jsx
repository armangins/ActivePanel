import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInfiniteProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { PAGINATION_DEFAULTS } from '../../shared/constants';

// Custom hooks
import {
  useProductFilters,
  useInfiniteScroll,
  useProductSort,
  useProductDelete
} from './hooks';

// Components
import ProductDetailsModal from './ProductDetailsModal/ProductDetailsModal';
import ProductsHeader from './ProductsHeader';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import ProductList from './ProductList';
import { LoadMoreIndicator } from './LoadMoreIndicator';
import { EmptyState, LoadingState, ErrorState } from '../ui';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useDeleteProduct } from '../../hooks/useProducts';

const PER_PAGE = PAGINATION_DEFAULTS.PRODUCTS_PER_PAGE;

const Products = () => {
  const navigate = useNavigate();
  const { t, formatCurrency, isRTL } = useLanguage();

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null); // State for delete modal
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [gridColumns, setGridColumns] = useState(4);

  // Filter management
  const filters = useProductFilters();

  // Data fetching
  const {
    data,
    isLoading: loading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch
  } = useInfiniteProducts({
    per_page: PER_PAGE,
    search: filters.debouncedSearchQuery,
    category: filters.selectedCategory,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    _fields: ['id', 'name', 'type', 'status', 'stock_status',
      'stock_quantity', 'price', 'regular_price',
      'sale_price', 'images', 'categories', 'sku']
  });

  // Categories
  const { data: categories = [] } = useCategories();

  // Flatten products from pages
  const allProducts = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalProducts = data?.pages[0]?.total || 0;

  // Sorting
  const sortedProducts = useProductSort(allProducts, sortField, sortDirection);

  // Infinite scroll
  const { handleLoadMore } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    loading,
    fetchNextPage
  });

  // Delete mutation
  const deleteMutation = useDeleteProduct();

  // Handle delete click (opens modal)
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  // Handle confirm delete (executes mutation)
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteMutation.mutateAsync(productToDelete.id);

      // If we deleted the currently viewed product, close the details modal
      if (selectedProduct?.id === productToDelete.id) {
        setIsDetailsOpen(false);
        setSelectedProduct(null);
      }

      setProductToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      // You might want to show a toast here
    }
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Computed values
  const { displayedCount, totalCount } = useMemo(() => ({
    displayedCount: sortedProducts.length,
    totalCount: totalProducts || allProducts.length
  }), [sortedProducts.length, totalProducts, allProducts.length]);

  // Loading state - only show full page loading on initial load
  if (loading && !allProducts.length && !filters.searchQuery && !filters.selectedCategory && !filters.minPrice && !filters.maxPrice) {
    return <LoadingState message={t('loadingProducts')} />;
  }

  // Error state
  if (error && !allProducts.length) {
    return <ErrorState error={error.message || t('error')} onRetry={() => refetch()} fullPage />;
  }

  return (
    <div className="space-y-6">
      <ProductsHeader
        displayedCount={displayedCount}
        totalCount={totalCount}
        onCreateProduct={() => navigate('/products/add')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        gridColumns={gridColumns}
        onGridColumnsChange={setGridColumns}
        isRTL={isRTL}
        t={t}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={filters.hasActiveFilters}
        activeFilterCount={filters.activeFilterCount}
        showFilters={showFilters}
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        categories={categories}
        selectedCategory={filters.selectedCategory}
        onCategoryChange={filters.setSelectedCategory}
        minPrice={filters.minPrice}
        onMinPriceChange={filters.setMinPrice}
        maxPrice={filters.maxPrice}
        onMaxPriceChange={filters.setMaxPrice}
      />

      <ProductFilters
        hasActiveFilters={filters.hasActiveFilters}
        onClearFilters={filters.clearFilters}
        isRTL={isRTL}
        t={t}
      />

      {error && (
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-orange-600">{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingState message={t('searching')} />
      ) : sortedProducts.length === 0 ? (
        <EmptyState
          message={t('noProducts')}
          description={filters.searchQuery ? t('trySearch') : t('getStarted')}
          isRTL={isRTL}
        />
      ) : viewMode === 'grid' ? (
        <ProductGrid
          products={sortedProducts}
          columns={gridColumns}
          isLoading={loading}
          onView={(product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }}
          onEdit={(product) => navigate(`/products/edit/${product.id}`)}
          onDelete={handleDeleteClick}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
        />
      ) : (
        <ProductList
          products={sortedProducts}
          isLoading={loading}
          onView={(product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }}
          onEdit={(product) => navigate(`/products/edit/${product.id}`)}
          onDelete={handleDeleteClick}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      <LoadMoreIndicator
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        allProducts={allProducts}
        totalProducts={totalProducts}
        onLoadMore={handleLoadMore}
        t={t}
      />

      {isDetailsOpen && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          formatCurrency={formatCurrency}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        t={t}
      />
    </div>
  );
};

export default Products;
