import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Filter, X, Package, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI, categoriesAPI } from '../../services/woocommerce';
import ProductModal from './ProductModal';

const PER_PAGE = 24;

const Products = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

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
        setProducts(data);
      } else {
        // Avoid duplicates by checking if product already exists
        setProducts((prev) => {
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

  // Infinite scroll effect
  useEffect(() => {
    // Only enable infinite scroll when there are no active filters/search
    const activeFilters = selectedCategory || minPrice || maxPrice || searchQuery;
    
    // Don't set up scroll listener if filters are active
    if (activeFilters) {
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        // Check if user is near the bottom of the page
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Load more when user is within 200px of the bottom
        if (scrollTop + windowHeight >= documentHeight - 200) {
          // Double check conditions before loading
          const stillActiveFilters = selectedCategory || minPrice || maxPrice || searchQuery;
          if (hasMore && !loading && !loadingMore && !stillActiveFilters) {
            loadProducts(page + 1, false);
          }
        }
        ticking = false;
      });
    };

    // Check if we need to load more immediately (content doesn't fill viewport)
    const checkInitialLoad = () => {
      // Wait a bit for DOM to update
      setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // If content is shorter than viewport and we have more to load
        if (documentHeight <= windowHeight + 100 && hasMore && !loading && !loadingMore) {
          loadProducts(page + 1, false);
        }
      }, 100);
    };

    // Check after products are loaded and rendered
    if (!loading && products.length > 0) {
      checkInitialLoad();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkInitialLoad, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkInitialLoad);
    };
  }, [hasMore, loading, loadingMore, page, selectedCategory, minPrice, maxPrice, searchQuery, loadProducts, products.length]);

  const refreshProducts = () => {
    loadProducts(1, true);
  };


  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteProduct'))) {
      return;
    }

    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalProducts((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    }
  };

  const filteredProducts = products.filter(product => {
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

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || searchQuery;
  const displayedCount = (searchQuery || selectedCategory || minPrice || maxPrice) ? filteredProducts.length : products.length;
  const totalCount = totalProducts || products.length;

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingProducts')}</p>
        </div>
      </div>
    );
  }

  if (error && !products.length) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => loadProducts(1, true)} className="btn-primary">
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('products')}</h1>
          <p className="text-gray-600 mt-1">
            {t('showing')} {displayedCount} {t('of')} {totalCount} {t('products').toLowerCase()}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className={`btn-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-2`}
        >
          <Plus size={20} />
          <span>{t('createProduct')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors`}
          >
            <Filter size={18} />
            <span>{t('filters')}</span>
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {[selectedCategory, minPrice, maxPrice, searchQuery].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card">
            <div className="space-y-4">
              {/* Search by Name or SKU */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('searchProducts')}
                </label>
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                  <input
                    type="text"
                    placeholder={t('searchProducts')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`input-field ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('category')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`input-field ${isRTL ? 'text-right' : ''}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <option value="">{t('allCategories')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price Filter */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('minPrice')}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={`input-field ${isRTL ? 'text-right' : ''}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Max Price Filter */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('maxPrice')}
                  </label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={`input-field ${isRTL ? 'text-right' : ''}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">{t('noProducts')}</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchQuery ? t('trySearch') : t('getStarted')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              {/* Product Image - Full width at top */}
              <div className="w-full aspect-square">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].src}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="text-gray-400" size={48} />
                  </div>
                )}
              </div>

              {/* Product Info Below Image */}
              <div className="p-4 flex flex-col flex-1">
                {/* Product Name, Stock Status, and SKU */}
                <div className="mb-3">
                  <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} justify-between mb-2`}>
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1">
                      {product.name || t('productName')}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                      product.stock_status === 'instock' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_status === 'instock' ? t('inStock') : t('outOfStock')}
                    </span>
                  </div>
                  {product.sku && (
                    <p className="text-sm text-gray-500">{t('sku')}: {product.sku}</p>
                  )}
                </div>

                {/* Price, Stock Quantity, and Action Buttons */}
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between pt-3 border-t border-gray-200 mt-auto`}>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(parseFloat(product.price || 0))}
                    </p>
                    {product.stock_quantity !== null && (
                      <p className="text-sm text-gray-500">
                        {t('stock')}: {product.stock_quantity}
                      </p>
                    )}
                  </div>
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} space-x-2`}>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('deleteProduct')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {loadingMore && !hasActiveFilters && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span>{t('loading')}</span>
          </div>
        </div>
      )}

      {/* Load More button (fallback if infinite scroll doesn't trigger) */}
      {hasMore && !loading && !loadingMore && !hasActiveFilters && (
        <div className="flex justify-center py-8">
          <button
            onClick={() => loadProducts(page + 1, false)}
            className="btn-secondary"
          >
            {t('loadMore')}
          </button>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && products.length > 0 && !hasActiveFilters && (
        <div className="text-center py-8 text-gray-500 text-sm">
          {t('showing')} {products.length} {t('of')} {totalProducts} {t('products').toLowerCase()}
        </div>
      )}

      {/* Product Modal */}
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



