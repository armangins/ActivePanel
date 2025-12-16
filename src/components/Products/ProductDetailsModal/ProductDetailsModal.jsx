import { useState } from 'react';
import { Modal, Tabs, Row, Col, theme, Card } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useVariations } from '../../../hooks/useVariations';
import { useProduct } from '../../../hooks/useProducts';
import ProductDetailsHeader from './ProductDetailsHeader';
import ProductDetailsBasicInfo from './ProductDetailsBasicInfo';
import ProductDetailsPricing from './ProductDetailsPricing';
import ProductDetailsMedia from './ProductDetailsMedia';
import ProductDetailsOrganization from './ProductDetailsOrganization';
import ProductDetailsDescription from './ProductDetailsDescription.jsx';

/**
 * ProductDetailsModal Component
 */
const ProductDetailsModal = ({ product: initialProduct, onClose, formatCurrency }) => {
  const { t, isRTL } = useLanguage();
  const { token } = theme.useToken();
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

  const contentStyle = {
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: 24,
    height: '100%'
  };

  const tabItems = [
    {
      key: 'general',
      label: t('general') || 'General',
      children: (
        <Row gutter={[24, 24]} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          {/* Left Column - Basic Info and Pricing */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={contentStyle}>
                <ProductDetailsBasicInfo
                  product={product}
                  isRTL={isRTL}
                  t={t}
                />
              </div>

              <div style={contentStyle}>
                <ProductDetailsPricing
                  product={product}
                  formatCurrency={formatCurrency}
                  isRTL={isRTL}
                  t={t}
                />
              </div>
            </div>
          </Col>

          {/* Right Column - Media and Organization */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={contentStyle}>
                <ProductDetailsMedia
                  product={product}
                  isRTL={isRTL}
                  t={t}
                />
              </div>

              <div style={contentStyle}>
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
          </Col>
        </Row>
      ),
    },
    {
      key: 'description',
      label: t('description') || 'Description',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, direction: isRTL ? 'rtl' : 'ltr' }}>
          {/* Short Description */}
          {product.short_description && (
            <div style={contentStyle}>
              <ProductDetailsDescription
                title={t('shortDescription')}
                content={product.short_description}
                isRTL={isRTL}
              />
            </div>
          )}

          {/* Full Description */}
          {product.description && (
            <div style={contentStyle}>
              <ProductDetailsDescription
                title={t('description')}
                content={product.description}
                isRTL={isRTL}
              />
            </div>
          )}

          {/* Empty State */}
          {!product.short_description && !product.description && (
            <div style={{ ...contentStyle, textAlign: 'center', padding: 32 }}>
              <p style={{ color: token.colorTextSecondary }}>{t('noDescription') || 'No description available'}</p>
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
      title={null}
      footer={null}
      width={1200}
      style={{ top: 20 }}
      styles={{
        body: { padding: 0, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' },
        content: { padding: 0, borderRadius: token.borderRadiusLG, overflow: 'hidden' }
      }}
      closeIcon={null}
    >
      <ProductDetailsHeader
        product={product}
        onClose={onClose}
        isRTL={isRTL}
        t={t}
      />
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

