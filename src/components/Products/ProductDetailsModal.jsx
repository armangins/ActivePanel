import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { variationsAPI } from '../../services/woocommerce';
import VariationCard from './VariationCard';

const ProductDetailsModal = ({ product, onClose, formatCurrency }) => {
  const { t, isRTL } = useLanguage();
  const [variations, setVariations] = useState([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [variationsError, setVariationsError] = useState(null);

  const isVariableProduct = product?.type === 'variable';

  useEffect(() => {
    const loadVariations = async () => {
      if (!isVariableProduct || !product?.id) return;
      
      try {
        setLoadingVariations(true);
        setVariationsError(null);
        const data = await variationsAPI.getByProductId(product.id);
        setVariations(data || []);
      } catch (error) {
        console.error('Failed to load variations:', error);
        setVariationsError(error.message || t('error'));
      } finally {
        setLoadingVariations(false);
      }
    };

    loadVariations();
  }, [product?.id, isVariableProduct, t]);

  if (!product) return null;

  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].src : null;

  const stockStatus = product.stock_status || 'instock';

  const regularPrice = product.regular_price || product.price || null;
  const salePrice = product.sale_price || null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2
            className={`text-2xl font-bold text-gray-900 ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            {t('productDetails') || t('products')}
          </h2>
          <div className="flex items-center gap-3">
            {product.permalink && (
              <a
                href={product.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                {t('viewOnSite')}
              </a>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              {t('cancel')}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Top section: image + basic info */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="text-gray-300" size={64} />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {product.name}
                </h3>
                {product.sku && (
                  <p className="text-sm text-gray-500">
                    {t('sku')}: {product.sku}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">{t('status')}</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      stockStatus === 'instock'
                        ? 'text-primary-500'
                        : 'text-red-600'
                    }`}
                    style={stockStatus === 'instock' ? { backgroundColor: '#EBF3FF' } : {}}
                  >
                    {stockStatus === 'instock'
                      ? t('inStock')
                      : t('outOfStock')}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-gray-700">
                    {t('stockQuantity')}
                  </p>
                  <p className="text-gray-800">
                    {product.stock_quantity ?? '-'}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">
                    {t('regularPrice')}
                  </p>
                  <p className="text-gray-800">
                    {regularPrice
                      ? formatCurrency(parseFloat(regularPrice))
                      : '-'}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">{t('salePrice')}</p>
                  <p className="text-gray-800">
                    {salePrice
                      ? formatCurrency(parseFloat(salePrice))
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          {product.short_description && (
            <div>
              <p className="font-medium text-gray-700">
                {t('shortDescription')}
              </p>
              <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: product.short_description,
                }}
              />
            </div>
          )}

          {product.description && (
            <div>
              <p className="font-medium text-gray-700">{t('description')}</p>
              <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div>
              <p className="font-medium text-gray-700">
                {t('categories')}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div>
              <p className="font-medium text-gray-700">
                {t('attributes')}
              </p>
              <div className="space-y-2 mt-2">
                {product.attributes.map((attr) => (
                  <div key={attr.id || attr.name}>
                    <p className="text-sm font-semibold text-gray-800">
                      {attr.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      {(attr.options || []).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variations Section - Only for Variable Products */}
          {isVariableProduct && (
            <div>
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('variations')} ({variations.length})
                </h3>
              </div>

              {loadingVariations ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('loading')}</p>
                </div>
              ) : variationsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{variationsError}</p>
                </div>
              ) : variations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('noVariations')}</p>
                </div>
              ) : (
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${isRTL ? 'rtl' : ''}`}>
                  {variations.map((variation) => (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      formatCurrency={formatCurrency}
                      isRTL={isRTL}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;


