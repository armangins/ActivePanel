import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInfiniteProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { productsAPI } from '../../services/woocommerce';
import ProductDetailsModal from './ProductDetailsModal/ProductDetailsModal';
import ProductsHeader from './ProductsHeader';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import ProductList from './ProductList';
import { EmptyState, LoadingState, ErrorState } from '../ui';
import { PAGINATION_DEFAULTS } from '../../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.PRODUCTS_PER_PAGE;

const Products = () => {
  const navigate = useNavigate();
  const { t, formatCurrency, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [gridColumns, setGridColumns] = useState(4);

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
    _fields: ['id', 'name', 'slug',
      'permalink', 'date_created', 'status',
      'stock_status', 'stock_quantity', 'price',
      'regular_price', 'sale_price', 'images',
      'categories', 'sku']
  });

  // Flatten the pages into a single array of products
  const allProducts = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const totalProducts = data?.pages[0]?.total || 0;

  const { data: categories = [] } = useCategories();

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.documentElement.scrollHeight - 300;

      if (scrollPosition >= bottomPosition && hasNextPage && !isFetchingNextPage && !loading) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, loading]);


  const handleDelete = async (id) => {
    if (selectedProduct?.id === id) {
      setIsDetailsOpen(false);
      setSelectedProduct(null);
    }

    try {
      await productsAPI.delete(id);
      refetch();
    } catch (err) {
      alert(t('error') + ': ' + err.message);
      refetch();
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory) {
      const productCategories = product.categories?.map(cat => cat.id.toString()) || [];
      if (!productCategories.includes(selectedCategory)) return false;
    }

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

      {hasNextPage && (
        <div className="mt-8 flex flex-col items-center gap-3">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">{t('loadingMore') || 'Loading more products...'}</span>
            </div>
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
            >
              {t('loadMore') || 'Load More Products'}
            </button>
          )}
          <div className="text-xs text-gray-500">
            {t('showing')} {allProducts.length} {t('of')} {totalProducts}
          </div>
        </div>
      )}

      {!hasNextPage && allProducts.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              {t('allProductsLoaded') || 'All products loaded'} ({totalProducts})
            </span>
          </div>
        </div>
      )}

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



