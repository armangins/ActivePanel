import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useVariations } from '../../../hooks/useVariations';
import { useProduct } from '../../../hooks/useProducts';
import { Button } from '../../ui';
import ProductDetailsHeader from './ProductDetailsHeader';
import ProductDetailsBasicInfo from './ProductDetailsBasicInfo';
import ProductDetailsPricing from './ProductDetailsPricing';
import ProductDetailsMedia from './ProductDetailsMedia';
import ProductDetailsOrganization from './ProductDetailsOrganization';
import ProductDetailsDescription from './ProductDetailsDescription';

/**
 * ProductDetailsModal Component
 * 
 * Main modal component for displaying product details in a read-only view.
 * Handles loading variations for variable products and coordinates all detail sections.
 * 
 * @param {Object} initialProduct - Product object from list (partial data)
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} formatCurrency - Function to format currency values
 */
const ProductDetailsModal = ({ product: initialProduct, onClose, formatCurrency }) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');

  // Fetch full product details to get description and short_description
  const { data: fullProduct } = useProduct(initialProduct?.id);

  // Merge initial product with full product details
  const product = { ...initialProduct, ...fullProduct };

  const isVariableProduct = product?.type === 'variable';

  // Use React Query hook to load variations (only if variable product)
  const {
    data: variationsData,
    isLoading: loadingVariations,
    error: variationsError
  } = useVariations(product?.id, {
    enabled: isVariableProduct && !!product?.id
  });

  const variations = variationsData?.data || [];

  // Debug logging - Remove after testing
  console.log('🔍 ProductDetailsModal Debug:', {
    productId: product?.id,
    productType: product?.type,
    isVariableProduct,
    variationsData,
    variations,
    loadingVariations,
    error: variationsError?.message
  });

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 sm:rounded-lg max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <ProductDetailsHeader
          product={product}
          onClose={onClose}
          isRTL={isRTL}
          t={t}
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className={`flex ${'flex-row-reverse'} justify-end`}>
            <Button
              onClick={() => setActiveTab('description')}
              variant="ghost"
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors rounded-none h-auto focus:outline-none focus:ring-0 ${activeTab === 'description'
                ? 'border-primary-500 text-primary-500 bg-transparent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent'
                }`}
            >
              {t('description') || 'Description'}
            </Button>
            <Button
              onClick={() => setActiveTab('general')}
              variant="ghost"
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors rounded-none h-auto focus:outline-none focus:ring-0 ${activeTab === 'general'
                ? 'border-primary-500 text-primary-500 bg-transparent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent'
                }`}
            >
              {t('general') || 'General'}
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-gray-50">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${'rtl'}`}>
              {/* Left Column - Basic Info and Pricing */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ProductDetailsBasicInfo
                    product={product}
                    isRTL={isRTL}
                    t={t}
                  />
                </div>

                {/* Pricing Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ProductDetailsPricing
                    product={product}
                    formatCurrency={formatCurrency}
                    isRTL={isRTL}
                    t={t}
                  />
                </div>
              </div>

              {/* Right Column - Media and Organization */}
              <div className="space-y-6">
                {/* Media Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ProductDetailsMedia
                    product={product}
                    isRTL={isRTL}
                    t={t}
                  />
                </div>

                {/* Organization Section (Variations) */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ProductDetailsOrganization
                    product={product}
                    isRTL={isRTL}
                    t={t}
                    formatCurrency={formatCurrency}
                    variations={variations}
                    loadingVariations={loadingVariations}
                    variationsError={variationsError?.message || null}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              {/* Short Description */}
              {product.short_description && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ProductDetailsDescription
                    title={t('shortDescription')}
                    content={product.short_description}
                    isRTL={isRTL}
                  />
                </div>
              )}

              {/* Full Description */}
              {product.description && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <ProductDetailsDescription
                    title={t('description')}
                    content={product.description}
                    isRTL={isRTL}
                  />
                </div>
              )}

              {/* Empty State */}
              {!product.short_description && !product.description && (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">{t('noDescription') || 'No description available'}</p>
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

