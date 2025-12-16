import { memo } from 'react';
import { ReloadOutlined as Loader, ThunderboltOutlined as Sparkles } from '@ant-design/icons';
import { Input, InputNumber, Select, Button, Tag, Space, Typography, Row, Col, Flex, Divider, Tooltip } from 'antd';
import { ImageUpload } from '../';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text } = Typography;
const { Option } = Select;

/**
 * VariationForm Component
 * 
 * Shared form component for creating and editing variations.
 * Uses strict Ant Design components.
 */
const VariationForm = ({
  formData,
  onFormDataChange,
  selectedAttributeIds = [],
  attributes = [],
  attributeTerms = {},
  generatingSKU = false,
  onGenerateSKU,
  parentProductName = '',
  parentSku = '',
  existingVariationSkus = [],
  currentVariationId = null,
  disabled = false,
  onToggleAttribute,
  isAttributeSelected,
}) => {
  const { t, isRTL } = useLanguage();

  // Validate SKU for duplicates
  const getSkuValidationError = () => {
    const currentSku = (formData.sku || '').trim();
    if (!currentSku) return null; // Empty SKU is allowed

    // Check against parent SKU
    if (parentSku && currentSku === parentSku.trim()) {
      return t('skuCannotMatchParent') || 'המק״ט לא יכול להיות זהה למק״ט האב';
    }

    // Check against other variations
    const hasDuplicate = existingVariationSkus.some(sku => {
      return sku && sku.trim() === currentSku;
    });

    if (hasDuplicate) {
      return t('skuAlreadyUsedByVariation') || 'מק״ט זה כבר בשימוש על ידי וריאציה אחרת';
    }

    return null;
  };

  const skuError = getSkuValidationError();

  const handleAttributeChange = (attributeId, termId) => {
    onFormDataChange({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attributeId]: termId ? parseInt(termId) : null
      }
    });
  };

  const handleFieldChange = (field, value) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Attribute Selection Area */}
      <div>

        {onToggleAttribute && (
          <Flex wrap="wrap" gap="small" justify="start" style={{ marginBottom: '16px' }}>
            <Text type="secondary" style={{ padding: '4px 0', fontSize: '13px' }}>
              {selectedAttributeIds.length === 0
                ? (t('clickToAddAttribute') || 'בחר תכונות :')
                : (t('addMore') || 'הוסף עוד:')}
            </Text>
            {attributes.map(attr => {
              const isSelected = selectedAttributeIds.includes(attr.id);
              if (isSelected) return null;
              return (
                <Button
                  key={attr.id}
                  size="small"
                  onClick={() => onToggleAttribute(attr.id)}
                  icon={<span>+</span>}
                  type="dashed"
                >
                  {attr.name}
                </Button>
              );
            })}

          </Flex>
        )}

        {selectedAttributeIds.length > 0 ? (
          <Row gutter={[16, 16]}>
            {selectedAttributeIds
              .filter(attrId => {
                const attribute = attributes.find(attr => attr.id === attrId);
                return !!attribute;
              })
              .map((attributeId, index, array) => {
                const attribute = attributes.find(attr => attr.id === attributeId);
                const terms = attributeTerms[attributeId] || [];

                const isColor = ['color', 'colour', 'צבע', 'colors', 'colours'].some(k => attribute.name.toLowerCase().includes(k));
                const isSingle = array.length === 1;
                const span = isColor || isSingle ? 24 : 12;

                return (
                  <Col xs={24} sm={span} key={attributeId}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{attribute.name}</Text>


                    </div>
                    {onToggleAttribute && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        style={{ padding: 0 }}
                        onClick={() => onToggleAttribute(attributeId)}
                      >
                        {t('remove') || 'הסר'}
                      </Button>
                    )}

                    {isColor ? (
                      <Flex wrap="wrap" gap="small" justify="start">
                        {terms.map(term => {
                          const isSelected = formData.attributes?.[attributeId] === term.id;
                          const colorValue = term.slug;

                          return (
                            <Tooltip title={term.name} key={term.id}>
                              <div
                                onClick={() => !disabled && handleAttributeChange(attributeId, term.id)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: colorValue,
                                  border: `2px solid ${isSelected ? '#1890ff' : '#d9d9d9'}`,
                                  cursor: disabled ? 'not-allowed' : 'pointer',
                                  position: 'relative',
                                  boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
                                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {isSelected && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: '#fff',
                                    borderRadius: '50%',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }} />
                                )}
                              </div>
                            </Tooltip>
                          );
                        })}
                      </Flex>
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder={t('select') || 'בחר...'}
                        value={formData.attributes?.[attributeId] || undefined}
                        onChange={(value) => handleAttributeChange(attributeId, value)}
                        disabled={disabled}
                        align="right"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {terms.map(term => (
                          <Option key={term.id} value={term.id}>{term.name}</Option>
                        ))}
                      </Select>
                    )}
                  </Col>
                );
              })}
          </Row>
        ) : (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            border: '1px dashed #d9d9d9',
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <Text type="secondary">
              {t('selectAttributesAbove') || 'אנא בחר תכונות מהרשימה למעלה כדי להתחיל'}
            </Text>
          </div>
        )}
      </div>

      <Divider style={{ margin: '0' }} />

      {/* Price Fields */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Text strong style={{ display: 'block', marginBottom: '8px', textAlign: 'right' }}>
            {t('regularPrice') || 'מחיר רגיל'} <span style={{ color: '#ff4d4f' }}>*</span>
          </Text>
          <InputNumber
            style={{ width: '100%' }}
            value={formData.regular_price}
            onChange={(value) => handleFieldChange('regular_price', value)}
            placeholder="0.00"
            min={0}
            step={0.01}
            addonAfter="₪"
            disabled={disabled}
            size="large"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text strong style={{ display: 'block', marginBottom: '8px', textAlign: 'right' }}>
            {t('salePrice') || 'מחיר מבצע'}
          </Text>
          <InputNumber
            style={{ width: '100%' }}
            value={formData.sale_price}
            onChange={(value) => handleFieldChange('sale_price', value)}
            placeholder="0.00"
            min={0}
            step={0.01}
            addonAfter="₪"
            disabled={disabled}
            size="large"
          />
        </Col>
      </Row>

      {/* SKU and Stock */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Text strong style={{ display: 'block', marginBottom: '8px', textAlign: 'right' }}>
            {t('sku') || 'מק״ט'}
          </Text>
          <Input
            value={formData.sku}
            onChange={(e) => handleFieldChange('sku', e.target.value)}
            placeholder={t('enterSKU') || 'הכנס SKU'}
            disabled={disabled}
            status={skuError ? 'error' : ''}
            size="large"
            style={{ width: '100%' }}
            suffix={
              <Tooltip title={t('createWithAI') || 'צור בעזרת AI'}>
                <Button
                  type="text"
                  size="small"
                  onClick={() => onGenerateSKU?.()}
                  disabled={disabled || generatingSKU}
                  icon={generatingSKU ? <Loader spin /> : <Sparkles />}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    height: 'auto',
                    color: '#1890ff',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                />
              </Tooltip>
            }
          />
          {skuError && <Text type="danger" style={{ fontSize: '12px' }}>{skuError}</Text>}
        </Col>
        <Col xs={24} sm={12}>
          <Text strong style={{ display: 'block', marginBottom: '8px', textAlign: 'right' }}>
            {t('stockQuantity') || 'כמות במלאי'}
          </Text>
          <InputNumber
            style={{ width: '100%' }}
            value={formData.stock_quantity}
            onChange={(value) => handleFieldChange('stock_quantity', value)}
            placeholder="0"
            min={0}
            disabled={disabled}
            size="large"
          />
        </Col>
      </Row>

      {/* Image Upload */}
      <Flex vertical gap="small" align="start">
        <Text strong>
          {t('variationImage') || 'תמונת וריאציה'}
        </Text>
        <ImageUpload
          value={formData.image}
          onChange={(image) => handleFieldChange('image', image)}
          disabled={disabled}
        />
      </Flex>
    </div>
  );
};

export default memo(VariationForm);





