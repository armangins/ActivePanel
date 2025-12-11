import { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useInfiniteProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { PAGINATION_DEFAULTS } from '../../../shared/constants';
import { productsAPI } from '../../../services/woocommerce';

// Custom hooks
import {
  useProductFilters,
  useInfiniteScroll,
  useProductSort,
  useProductDelete
} from '../hooks';

// Components
// Lazy load modals to reduce initial bundle size
const ProductDetailsModal = lazy(() => import('../ProductDetailsModal/ProductDetailsModal'));
const DeleteConfirmationModal = lazy(() => import('../DeleteConfirmationModal/DeleteConfirmationModal'));
const BulkDeleteConfirmationModal = lazy(() => import('../BulkDeleteConfirmationModal/BulkDeleteConfirmationModal'));

import ProductsHeader from '../ProductsHeader/ProductsHeader';
import ProductFilters from '../ProductFilters/ProductFilters';
import ProductGrid from '../ProductGrid/ProductGrid';
import ProductList from '../ProductList/ProductList';
import { LoadMoreIndicator } from '../LoadMoreIndicator/LoadMoreIndicator';
import { EmptyState, LoadingState, ErrorState, Toast } from '../../ui';
import { useDeleteProduct } from '../../../hooks/useProducts';

const PER_PAGE = PAGINATION_DEFAULTS.PRODUCTS_PER_PAGE;

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [selectedProductIds, setSelectedProductIds] = useState(new Set()); // State for bulk selection
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [toast, setToast] = useState(null); // State for toast notifications

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
      'stock_quantity', 'regular_price',
      'sale_price', 'images', 'categories', 'sku']
  });

  // Categories
  const { data: categories = [] } = useCategories();

  // Flatten products from pages
  const allProducts = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalProducts = data?.pages[0]?.total || 0;

  // Auto-open product if view param is present in URL
  useEffect(() => {
    const viewProductId = searchParams.get('view');
    if (viewProductId && !selectedProduct && !isDetailsOpen) {
      const productId = parseInt(viewProductId);
      
      // First, try to find in already loaded products
      const productToView = allProducts.find(p => p.id === productId);
      
      if (productToView) {
        setSelectedProduct(productToView);
        setIsDetailsOpen(true);
        // Remove the view param from URL after opening
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('view');
        setSearchParams(newSearchParams, { replace: true });
      } else if (allProducts.length > 0) {
        // Product not in current list, fetch it directly
        productsAPI.getById(productId)
          .then(product => {
            if (product) {
              setSelectedProduct(product);
              setIsDetailsOpen(true);
              // Remove the view param from URL after opening
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete('view');
              setSearchParams(newSearchParams, { replace: true });
            }
          })
          .catch(error => {
            console.error('Failed to fetch product:', error);
            // Remove invalid view param
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('view');
            setSearchParams(newSearchParams, { replace: true });
          });
      }
    }
  }, [searchParams, allProducts, selectedProduct, isDetailsOpen, setSearchParams]);

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
      
      // Show success toast
      setToast({
        message: t('productDeletedSuccessfully') || `המוצר "${productToDelete.name}" נמחק בהצלחה`,
        type: 'success'
      });
    } catch (err) {
      console.error('Delete error:', err);
      // Show error toast
      setToast({
        message: t('deleteProductFailed') || `שגיאה במחיקת המוצר: ${err.message || t('error')}`,
        type: 'error'
      });
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedProductIds.size > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  // Handle confirm bulk delete
  const handleConfirmBulkDelete = async () => {
    if (selectedProductIds.size === 0) return;

    try {
      const idsArray = Array.from(selectedProductIds);
      const count = idsArray.length;
      const wasViewingDeletedProduct = selectedProduct && selectedProductIds.has(selectedProduct.id);
      
      await productsAPI.bulkDelete(idsArray);

      // Clear selection
      setSelectedProductIds(new Set());

      // If we deleted the currently viewed product, close the details modal
      if (wasViewingDeletedProduct) {
        setIsDetailsOpen(false);
        setSelectedProduct(null);
      }

      // Refetch products
      refetch();

      setShowBulkDeleteModal(false);
      
      // Show success toast
      const successMessage = t('productsDeletedSuccessfully')?.replace('{count}', count) || `${count} מוצר(ים) נמחקו בהצלחה`;
      setToast({
        message: successMessage,
        type: 'success'
      });
    } catch (err) {
      console.error('Bulk delete error:', err);
      setShowBulkDeleteModal(false);
      
      // Show error toast
      setToast({
        message: t('bulkDeleteFailed') || `שגיאה במחיקת המוצרים: ${err.message || t('error')}`,
        type: 'error'
      });
    }
  };

  // Clear selection when view mode changes
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode !== 'list') {
      setSelectedProductIds(new Set());
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
        onViewModeChange={handleViewModeChange}
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
        selectedProductIds={selectedProductIds}
        onBulkDelete={handleBulkDeleteClick}
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
          selectedProductIds={selectedProductIds}
          onSelectionChange={setSelectedProductIds}
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

      {/* Lazy-loaded modals wrapped in Suspense */}
      <Suspense fallback={null}>
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

        {/* Bulk Delete Confirmation Modal */}
        <BulkDeleteConfirmationModal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleConfirmBulkDelete}
          productCount={selectedProductIds.size}
          t={t}
        />
      </Suspense>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Products;
