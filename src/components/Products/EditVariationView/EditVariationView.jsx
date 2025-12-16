import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRightOutlined as ArrowRightIcon, SaveOutlined as FloppyDiskIcon, CloseOutlined as X, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { variationsAPI, attributesAPI } from '../../../services/woocommerce';
import { Card, Button, Input, InputNumber, Select, Typography, Flex, Breadcrumb, Spin, Alert, Divider, theme, Image, Tag, Space } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const EditVariationView = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { id, variationId } = useParams();
  const { token } = theme.useToken();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variation, setVariation] = useState(null);
  const [formData, setFormData] = useState({
    regular_price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    stock_status: 'instock',
    image: null,
    attributes: {}, // { attributeId: termId }
  });
  const [errors, setErrors] = useState({});

  // Attributes state
  const [attributes, setAttributes] = useState([]);
  const [attributeTerms, setAttributeTerms] = useState({}); // { attributeId: terms[] }
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  useEffect(() => {
    if (id && variationId) {
      loadVariation(id, variationId);
      loadAttributes();
    }
  }, [id, variationId]);

  const loadAttributes = async () => {
    setLoadingAttributes(true);
    try {
      const attrs = await attributesAPI.getAll();
      setAttributes(attrs);
    } catch (err) {
      // Failed to load attributes
    } finally {
      setLoadingAttributes(false);
    }
  };

  const loadAttributeTerms = async (attributeId) => {
    // Only load terms if not already loaded
    if (attributeTerms[attributeId] !== undefined) return;

    try {
      const terms = await attributesAPI.getTerms(attributeId);
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: terms || []
      }));
    } catch (err) {
      setAttributeTerms(prev => ({
        ...prev,
        [attributeId]: []
      }));
    }
  };

  const loadVariation = async (productId, varId) => {
    setLoading(true);
    try {
      const variationData = await variationsAPI.getById(productId, varId);
      setVariation(variationData);

      // Initialize attributes from variation
      const attributesMap = {};
      if (variationData.attributes && variationData.attributes.length > 0) {
        // Load terms for each attribute in the variation
        const termPromises = variationData.attributes.map(async (attr) => {
          await loadAttributeTerms(attr.id);
          // Find the term ID that matches the option name
          const terms = await attributesAPI.getTerms(attr.id);
          const matchingTerm = terms?.find(term => term.name === attr.option);
          if (matchingTerm) {
            attributesMap[attr.id] = matchingTerm.id;
          }
        });

        // Wait for all terms to load
        await Promise.all(termPromises);
      }

      setFormData({
        regular_price: variationData.regular_price || '',
        sale_price: variationData.sale_price || '',
        sku: variationData.sku || '',
        stock_quantity: variationData.stock_quantity?.toString() || '',
        stock_status: variationData.stock_status || 'instock',
        image: variationData.image || null,
        attributes: attributesMap,
      });
    } catch (err) {
      navigate(`/products/edit/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build attributes array for WooCommerce
      const variationAttributes = Object.keys(formData.attributes)
        .filter(attributeId => formData.attributes[attributeId])
        .map(attributeId => {
          const attribute = attributes.find(attr => attr.id === parseInt(attributeId));
          const termId = formData.attributes[attributeId];
          const term = attributeTerms[attributeId]?.find(t => t.id === termId);

          return {
            id: parseInt(attributeId),
            name: attribute.name,
            option: term ? term.name : ''
          };
        });

      const updateData = {
        attributes: variationAttributes,
        regular_price: formData.regular_price || '',
        sale_price: formData.sale_price || '',
        sku: formData.sku || '',
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : null,
        stock_status: formData.stock_status,
      };

      // Add image if available
      if (formData.image && formData.image.id) {
        updateData.image = { id: formData.image.id };
      }

      await variationsAPI.update(id, variationId, updateData);
      navigate(`/products/edit/${id}`);
    } catch (error) {
      setErrors({ submit: error.message || t('saveFailed') });
    } finally {
      setSaving(false);
    }
  };

  const toggleAttributeTerm = (attributeId, termId) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: prev.attributes[attributeId] === termId ? null : termId
      }
    }));
  };

  const isTermSelected = (attributeId, termId) => {
    return formData.attributes[attributeId] === termId;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh', backgroundColor: token.colorBgLayout }}>
        <Flex vertical align="center" gap="middle">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <Text type="secondary">{t('loading') || 'טוען...'}</Text>
        </Flex>
      </Flex>
    );
  }

  if (!variation) {
    return null;
  }

  // Get variation attributes text
  const attributesText = variation.attributes && variation.attributes.length > 0
    ? variation.attributes.map(attr => `${attr.name}: ${attr.option}`).join(', ')
    : '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: token.colorBgLayout, padding: 24, direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { title: t('dashboard') },
          { title: t('products') },
          {
            title: variation?.parent_name || t('product'),
            onClick: () => navigate(`/products/edit/${id}`),
            className: 'cursor-pointer hover:text-primary-500'
          },
          { title: t('editVariation') || 'ערוך וריאציה' }
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24, flexDirection: isRTL ? 'row' : 'row-reverse' }}>
        <Button
          icon={<ArrowRightIcon rotate={isRTL ? 180 : 0} />}
          onClick={() => navigate(`/products/edit/${id}`)}
          type="text"
        >
          {t('back') || 'חזור'}
        </Button>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <Title level={2} style={{ margin: 0 }}>
            {t('editVariation') || 'ערוך וריאציה'}
          </Title>
          {attributesText && (
            <Text type="secondary">{attributesText}</Text>
          )}
        </div>
      </Flex>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card bodyStyle={{ padding: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Variation Image */}
            {formData.image && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
                  {t('image') || 'תמונה'}
                </Text>
                <div style={{ width: 128, height: 128, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}>
                  <Image
                    src={formData.image.src || formData.image.url}
                    alt={attributesText}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                </div>
              </div>
            )}

            {/* Regular Price */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>{t('regularPrice')}</Text>
              <Input
                prefix={isRTL ? null : '₪'}
                suffix={isRTL ? '₪' : null}
                value={formData.regular_price}
                onChange={(e) => setFormData(prev => ({ ...prev, regular_price: e.target.value }))}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                style={{ width: '100%' }}
              />
            </div>

            {/* Sale Price */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>{t('salePrice')}</Text>
              <Input
                prefix={isRTL ? null : '₪'}
                suffix={isRTL ? '₪' : null}
                value={formData.sale_price}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                style={{ width: '100%' }}
              />
            </div>

            {/* SKU */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>{t('sku')}</Text>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder={t('sku') || 'SKU'}
                style={{ width: '100%' }}
              />
            </div>

            {/* Stock Status */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
                {t('stockStatus')}
              </Text>
              <Select
                value={formData.stock_status}
                onChange={(value) => setFormData(prev => ({ ...prev, stock_status: value }))}
                style={{ width: '100%' }}
              >
                <Option value="instock">{t('inStock')}</Option>
                <Option value="outofstock">{t('outOfStock')}</Option>
                <Option value="onbackorder">{t('onBackorder')}</Option>
              </Select>
            </div>

            {/* Stock Quantity */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>{t('stockQuantity')}</Text>
              <Input
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="0"
                type="number"
                min="0"
                style={{ width: '100%' }}
              />
            </div>

            <Divider />

            {/* Attributes Section */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 16, textAlign: 'right' }}>
                {t('attributes') || 'תכונות'}
              </Text>

              {loadingAttributes ? (
                <Flex justify="center" align="center" style={{ padding: 16 }}>
                  <Spin />
                  <Text type="secondary" style={{ marginLeft: 8 }}>{t('loading') || 'טוען...'}</Text>
                </Flex>
              ) : attributes.length === 0 ? (
                <Text type="secondary" style={{ display: 'block', textAlign: 'right' }}>{t('noAttributes') || 'אין תכונות זמינות'}</Text>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {attributes.map(attribute => {
                    const terms = attributeTerms[attribute.id];
                    const isLoadingTerms = terms === undefined;
                    const selectedTermId = formData.attributes[attribute.id];

                    return (
                      <div key={attribute.id}>
                        <Text style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
                          {attribute.name}
                        </Text>
                        {isLoadingTerms ? (
                          <Flex align="center" justify="end" gap="small">
                            <Spin size="small" />
                            <Text type="secondary">{t('loading')}</Text>
                          </Flex>
                        ) : !terms || terms.length === 0 ? (
                          <Text type="secondary" style={{ display: 'block', textAlign: 'right' }}>
                            {t('noTermsAvailable') || 'אין אפשרויות זמינות לתכונה זו'}
                          </Text>
                        ) : (
                          <Flex wrap="wrap" gap="small" justify="end">
                            {terms.map(term => {
                              const isSelected = isTermSelected(attribute.id, term.id);
                              return (
                                <Tag.CheckableTag
                                  key={term.id}
                                  checked={isSelected}
                                  onChange={() => toggleAttributeTerm(attribute.id, term.id)}
                                  style={{
                                    padding: '4px 12px',
                                    fontSize: 14,
                                    border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorder}`,
                                    backgroundColor: isSelected ? token.colorPrimaryBg : 'transparent'
                                  }}
                                >
                                  {term.name}
                                  {isSelected && <X style={{ marginRight: 4, marginLeft: 0 }} />}
                                </Tag.CheckableTag>
                              );
                            })}
                          </Flex>
                        )}
                      </div>
                    );
                  })}
                </Space>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <Alert message={errors.submit} type="error" showIcon />
            )}

            {/* Action Buttons */}
            <Flex justify="start" gap="small" style={{ flexDirection: 'row-reverse' }}>
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
                icon={<FloppyDiskIcon />}
                size="large"
              >
                {t('save')}
              </Button>
              <Button
                onClick={() => navigate(`/products/edit/${id}`)}
                size="large"
              >
                {t('cancel') || 'ביטול'}
              </Button>
            </Flex>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default EditVariationView;

