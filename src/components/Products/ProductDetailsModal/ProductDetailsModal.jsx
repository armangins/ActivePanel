import { useState } from 'react';
import { Modal, Tabs } from 'antd';
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



  if (!product) return null;

  const tabItems = [
    {
      key: 'general',
      label: t('general') || 'General',
      children: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, direction: isRTL ? 'rtl' : 'ltr' }}>
          {/* Left Column - Basic Info and Pricing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Basic Info Section */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
              <ProductDetailsBasicInfo
                product={product}
                isRTL={isRTL}
                t={t}
              />
            </div>

            {/* Pricing Section */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
              <ProductDetailsPricing
                product={product}
                formatCurrency={formatCurrency}
                isRTL={isRTL}
                t={t}
              />
            </div>
          </div>

          {/* Right Column - Media and Organization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Media Section */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
              <ProductDetailsMedia
                product={product}
                isRTL={isRTL}
                t={t}
              />
            </div>

            {/* Organization Section (Variations) */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
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
      ),
    },
    {
      key: 'description',
      label: t('description') || 'Description',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Short Description */}
          {product.short_description && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
              <ProductDetailsDescription
                title={t('shortDescription')}
                content={product.short_description}
                isRTL={isRTL}
              />
            </div>
          )}

          {/* Full Description */}
          {product.description && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
              <ProductDetailsDescription
                title={t('description')}
                content={product.description}
                isRTL={isRTL}
              />
            </div>
          )}

          {/* Empty State */}
          {!product.short_description && !product.description && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 8, padding: 32, textAlign: 'center' }}>
              <p style={{ color: '#8c8c8c' }}>{t('noDescription') || 'No description available'}</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={!!product}
      onCancel={onClose}
      title={t('productDetails') || t('products')}
      footer={null}
      width={1200}
      style={{ top: 20 }}
      styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ padding: '0 24px 24px' }}

      />
    </Modal>
  );
};

export default ProductDetailsModal;

