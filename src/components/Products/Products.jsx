import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { productsAPI } from '../../services/woocommerce';

const PER_PAGE = 24;

const Products = () => {
  const { t, formatCurrency, isRTL } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadProducts(1, true);
  }, []);

  const loadProducts = async (pageToLoad = 1, reset = false) => {
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
      setProducts((prev) => (reset ? data : [...prev, ...data]));
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  };

  const refreshProducts = () => {
    loadProducts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadProducts(page + 1);
    }
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

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayedCount = searchQuery ? filteredProducts.length : products.length;
  const totalCount = totalProducts || products.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
            setEditingProduct(null);
            setShowModal(true);
          }}
          className={`btn-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-2`}
        >
          <Plus size={20} />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
          <input
            type="text"
            placeholder={t('searchProducts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`input-field ${isRTL ? 'pr-10' : 'pl-10'}`}
          />
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow">
              {/* Product Image */}
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].src}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="text-gray-400" size={48} />
                </div>
              )}

              {/* Product Name, Stock Status, and SKU below image */}
              <div className="mb-4">
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : ''} justify-between mb-2`}>
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
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
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between pt-4 border-t border-gray-200`}>
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
                    onClick={() => {
                      setEditingProduct(product);
                      setShowModal(true);
                    }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={t('editProduct')}
                  >
                    <Edit size={18} />
                  </button>
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
          ))}
        </div>
      )}

      {hasMore && !searchQuery && filteredProducts.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-secondary px-6"
          >
            {loadingMore ? t('loading') : t('loadMore')}
          </button>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingProduct(null);
            refreshProducts();
          }}
        />
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }) => {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity || '',
    description: product?.description || '',
    stock_status: product?.stock_status || 'instock',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (product) {
        await productsAPI.update(product.id, formData);
      } else {
        await productsAPI.create({ ...formData, type: 'simple' });
      }
      onSave();
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className={`text-2xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {product ? t('editProduct') : t('createProduct')}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('productName')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('price')} *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('sku')}
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('stockQuantity')}
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('stockStatus')}
              </label>
              <select
                value={formData.stock_status}
                onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                className="input-field"
              >
                <option value="instock">{t('inStock')}</option>
                <option value="outofstock">{t('outOfStock')}</option>
                <option value="onbackorder">{t('onBackorder')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="input-field"
            />
          </div>

          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-end space-x-3 pt-4 border-t border-gray-200`}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={saving}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? t('saving') : product ? t('updateProduct') : t('createProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;



