import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesAPI } from '../../services/woocommerce';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ProductDetailsModal from './ProductDetailsModal/ProductDetailsModal';
import ProductsHeader from './ProductsHeader';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import ProductList from './ProductList';
import { EmptyState, LoadingState, ErrorState } from '../ui';
import Pagination from '../ui/Pagination';
import { PAGINATION_DEFAULTS } from '../../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.PRODUCTS_PER_PAGE;

const Products = () => {
  const navigate = useNavigate();
  const { t, formatCurrency, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // view-only details
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortField, setSortField] = useState(null); // 'name' or 'price'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [gridColumns, setGridColumns] = useState(4);

  // Use the useProducts hook for data fetching with caching
  const {
    data: productsData,
    isLoading: loading,
    error,
    refetch
  } = useProducts({
    page,
    per_page: PER_PAGE,
    _fields: ['id', 'name', 'slug', 'permalink', 'date_created', 'status', 'stock_status', 'stock_quantity', 'price', 'regular_price', 'sale_price', 'images', 'categories', 'sku']
  });

  const allProducts = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;

  // Use useCategories hook for data fetching with caching
  const { data: categories = [] } = useCategories();

  const refreshProducts = () => {
    refetch();
  };


  const handleDelete = async (id) => {
    // Close any open modals for this product
    if (selectedProduct?.id === id) {
      setIsDetailsOpen(false);
      setSelectedProduct(null);
    }

    try {
      // Optimistically update UI first for instant feedback
      // Note: With React Query, we should ideally use mutation's onMutate, 
      // but for now we'll just refetch after delete

      // Then delete from API
      await productsAPI.delete(id);
      refetch();
    } catch (err) {
      alert(t('error') + ': ' + err.message);
      refetch();
    }
  };

  // Client-side filtering - instant!
  const filteredProducts = allProducts.filter(product => {
    // Search filter
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory) {
      const productCategories = product.categories?.map(cat => cat.id.toString()) || [];
      if (!productCategories.includes(selectedCategory)) return false;
    }

    // Price range filter
    const price = parseFloat(product.price || 0);
    if (minPrice && price < parseFloat(minPrice)) return false;
    if (maxPrice && price > parseFloat(maxPrice)) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === 'name') {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    }

    if (sortField === 'price') {
      const priceA = parseFloat(a.price || a.regular_price || 0);
      const priceB = parseFloat(b.price || b.regular_price || 0);
      if (sortDirection === 'asc') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    }

    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || searchQuery;
  const displayedCount = sortedProducts.length;
  const totalCount = totalProducts || allProducts.length;

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const handleGridColumnsChange = (columns) => {
    setGridColumns(columns);
  };

  if (loading) {
    return <LoadingState message={t('loadingProducts')} />;
  }

  if (error && !allProducts.length) {
    return <ErrorState error={error.message || t('error')} onRetry={() => refetch()} fullPage />;
  }

  const activeFilterCount = [selectedCategory, minPrice, maxPrice, searchQuery].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ProductsHeader
        displayedCount={displayedCount}
        totalCount={totalCount}
        onCreateProduct={() => {
          // Navigate to the new Add Product view
          navigate('/products/add');
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        gridColumns={gridColumns}
        onGridColumnsChange={handleGridColumnsChange}
        isRTL={isRTL}
        t={t}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        showFilters={showFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        products={allProducts}
      />

      <ProductFilters
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        isRTL={isRTL}
        t={t}
      />

      {error && (
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-orange-600">{error}</p>
        </div>
      )}

      {sortedProducts.length === 0 ? (
        <EmptyState
          message={t('noProducts')}
          description={searchQuery ? t('trySearch') : t('getStarted')}
          isRTL={isRTL}
        />
      ) : viewMode === 'grid' ? (
        <ProductGrid
          products={sortedProducts}
          columns={gridColumns}
          onView={(product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }}
          onEdit={(product) => {
            // Navigate to edit view
            navigate(`/products/edit/${product.id}`);
          }}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
        />
      ) : (
        <ProductList
          products={sortedProducts}
          onView={(product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }}
          onEdit={(product) => {
            // Navigate to edit view
            navigate(`/products/edit/${product.id}`);
          }}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      {!hasActiveFilters && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          totalItems={totalProducts}
          itemsPerPage={PER_PAGE}
          isRTL={isRTL}
          t={t}
        />
      )}

      {/* Product Details Modal (view-only) */}
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

    </div>
  );
};

export default Products;



