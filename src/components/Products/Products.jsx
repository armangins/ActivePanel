import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI, categoriesAPI } from '../../services/woocommerce';
import ProductModal from './ProductModal';
import ProductDetailsModal from './ProductDetailsModal/ProductDetailsModal';
import ProductsHeader from './ProductsHeader';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import ProductList from './ProductList';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import LoadingMoreIndicator from './LoadingMoreIndicator';
import LoadMoreButton from './LoadMoreButton';
import EndOfResults from './EndOfResults';

const PER_PAGE = 24;

const Products = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [allProducts, setAllProducts] = useState([]); // All loaded products (no filter)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // edit/create modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // view-only details
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortField, setSortField] = useState(null); // 'name' or 'price'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
      } catch (err) {
        // Failed to load categories
      }
  };

  // Load all products without filters (for client-side filtering)
  const loadProducts = useCallback(async (pageToLoad = 1, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      const { data, total, totalPages } = await productsAPI.list({
        page: pageToLoad,
        per_page: PER_PAGE,
      });

      setTotalProducts(total);
      setHasMore(pageToLoad < totalPages);
      setPage(pageToLoad);
      
      if (reset) {
        setAllProducts(data);
      } else {
        // Avoid duplicates by checking if product already exists
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    loadProducts(1, true);
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll effect - only when no filters are active
  useEffect(() => {
    const activeFilters = selectedCategory || minPrice || maxPrice || searchQuery;
    
    // Don't set up scroll listener if filters are active (we already have all data)
    if (activeFilters) {
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 200) {
          const stillActiveFilters = selectedCategory || minPrice || maxPrice || searchQuery;
          if (hasMore && !loading && !loadingMore && !stillActiveFilters) {
            loadProducts(page + 1, false);
          }
        }
        ticking = false;
      });
    };

    const checkInitialLoad = () => {
      setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (documentHeight <= windowHeight + 100 && hasMore && !loading && !loadingMore) {
          loadProducts(page + 1, false);
        }
      }, 100);
    };

    if (!loading && allProducts.length > 0) {
      checkInitialLoad();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkInitialLoad, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkInitialLoad);
    };
  }, [hasMore, loading, loadingMore, page, selectedCategory, minPrice, maxPrice, searchQuery, loadProducts, allProducts.length]);

  const refreshProducts = () => {
    loadProducts(1, true);
  };


  const handleDelete = async (id) => {
    // Close any open modals for this product
    if (selectedProduct?.id === id) {
      setIsModalOpen(false);
      setIsDetailsOpen(false);
      setSelectedProduct(null);
    }

    try {
      // Optimistically update UI first for instant feedback
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalProducts((prev) => Math.max(prev - 1, 0));
      
      // Then delete from API
      await productsAPI.delete(id);
    } catch (err) {
      // Revert optimistic update on error
      alert(t('error') + ': ' + err.message);
      // Reload products to sync with server
      loadProducts(1, true);
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

  if (loading) {
    return <LoadingState t={t} />;
  }

  if (error && !allProducts.length) {
    return <ErrorState error={error} onRetry={() => loadProducts(1, true)} t={t} />;
  }

  const activeFilterCount = [selectedCategory, minPrice, maxPrice, searchQuery].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ProductsHeader
        displayedCount={displayedCount}
        totalCount={totalCount}
        onCreateProduct={() => {
          setSelectedProduct(null);
          setIsModalOpen(true);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {sortedProducts.length === 0 ? (
        <EmptyState searchQuery={searchQuery} isRTL={isRTL} t={t} />
      ) : viewMode === 'grid' ? (
        <ProductGrid
          products={sortedProducts}
          onView={(product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }}
          onEdit={(product) => {
            // Open modal immediately with existing product data
            setSelectedProduct(product);
            setIsModalOpen(true);
            // Load full product details in background
            productsAPI.getById(product.id)
              .then(fullProduct => {
                setSelectedProduct(fullProduct);
              })
              .catch(err => {
                // Failed to load full product details
                // Don't show error - modal already open with partial data
              });
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
            // Open modal immediately with existing product data
            setSelectedProduct(product);
            setIsModalOpen(true);
            // Load full product details in background
            productsAPI.getById(product.id)
              .then(fullProduct => {
                setSelectedProduct(fullProduct);
              })
              .catch(err => {
                // Failed to load full product details
                // Don't show error - modal already open with partial data
              });
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

      {loadingMore && !hasActiveFilters && <LoadingMoreIndicator t={t} />}

      {hasMore && !loading && !loadingMore && !hasActiveFilters && (
        <LoadMoreButton onLoadMore={() => loadProducts(page + 1, false)} t={t} />
      )}

      {!hasMore && allProducts.length > 0 && !hasActiveFilters && (
        <EndOfResults displayedCount={allProducts.length} totalCount={totalProducts} t={t} />
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

      {/* Product Modal (edit/create) */}
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
            refreshProducts();
          }}
        />
      )}
    </div>
  );
};

export default Products;



