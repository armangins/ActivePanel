import { useState, useEffect, useMemo, useCallback } from 'react';
import { CloseOutlined as X, ReloadOutlined as Loader, CheckOutlined as Check, InboxOutlined as Package } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesAPI, productsAPI } from '../../services/woocommerce';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

// ... other imports

// Inside component
<Input
  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder={t('searchProducts') || 'Search products...'}
  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
  allowClear
/>
import { EmptyState, LoadingState, Button } from '../ui';

const BulkAssignModal = ({ category, onClose, isRTL, t }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
    // Pre-select products that already belong to this category
    loadExistingCategoryProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.list({ per_page: 100 });
      setAllProducts(data || []);
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const loadExistingCategoryProducts = async () => {
    try {
      // Get products that already belong to this category
      const { data } = await productsAPI.list({
        per_page: 100,
        category: category.id
      });

      // Pre-select these products
      const existingIds = new Set((data || []).map(p => p.id));
      setSelectedProductIds(existingIds);
    } catch (err) {
      // Failed to load existing products
    }
  };

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  const toggleProductSelection = useCallback((productId) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedProductIds.size === filteredProducts.length) {
      // Deselect all
      setSelectedProductIds(new Set());
    } else {
      // Select all
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  }, [filteredProducts, selectedProductIds.size]);

  const handleSubmit = async () => {
    if (selectedProductIds.size === 0) {
      setError(t('selectAtLeastOneProduct') || 'Please select at least one product');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await categoriesAPI.bulkAssignProducts(category.id, Array.from(selectedProductIds));
      onClose();
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <LoadingState message={t('loadingProducts') || 'Loading products...'} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white sm:rounded-lg max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('bulkAssignProducts') || 'Bulk Assign Products'}
            </h2>
            <p className={`text-sm text-gray-600 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('assignToCategory') || 'Assign products to'}: <strong>{category.name}</strong>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchProducts') || 'Search products...'}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            allowClear
          />
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <EmptyState
              message={searchQuery ? (t('noProductsFound') || 'No products found') : (t('noProducts') || 'No products')}
              isRTL={isRTL}
            />
          ) : (
            <>
              {/* Select All */}
              <div className={`mb-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('selectAll') || 'Select All'} ({filteredProducts.length})
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {selectedProductIds.size} {t('selected') || 'selected'}
                </span>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.has(product.id);
                  const imageUrl = product.images && product.images.length > 0
                    ? product.images[0].src
                    : null;

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {/* Product Image */}
                      <div className="w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-300" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isSelected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                            }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium text-gray-900 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {product.name}
                          </p>
                          {product.sku && (
                            <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-gray-200 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {error && (
            <div className="flex-1">
              <p className={`text-sm text-orange-600 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
            </div>
          )}
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse ml-auto' : 'flex-row ml-auto'}`}>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              className="px-6"
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={saving || selectedProductIds.size === 0}
              className="flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{t('saving') || 'Saving...'}</span>
                </>
              ) : (
                <span>
                  {t('assignProducts') || 'Assign Products'} ({selectedProductIds.size})
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;
