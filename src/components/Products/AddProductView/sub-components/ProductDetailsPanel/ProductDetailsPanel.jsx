import { memo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { BulbOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button as AntButton, Space, Row, Col, Typography } from 'antd';
import { Card, Button } from '../../../../ui';
import { Input } from '../../../../ui/inputs';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useProductPricing } from './hooks/useProductPricing';
import {
  ProductTypeSelector,
  CategorySelector,
  PriceFields,
  DiscountSelector,
  SkuAndStockFields,
  ShortDescriptionField,
  DescriptionField
} from '../';

/**
 * ProductDetailsPanel Component
 * 
 * Left panel component containing all product details form fields:
 * - Product Type
 * - Product Name
 * - Category
 * - Price Fields
 * - Discount Selector
 * - SKU and Stock
 * - Short Description
 * - Description
 * 
 * @param {Object} formData - Product form data
 * @param {Object} errors - Form validation errors
 * @param {function} onFormDataChange - Callback when form data changes
 * @param {string} productType - Product type (simple/variable)
 * @param {function} onProductTypeChange - Callback when product type changes
 * @param {Array} categories - Available categories
 * @param {string} selectedDiscount - Selected discount percentage
 * @param {function} onDiscountSelect - Callback when discount is selected
 * @param {function} onDiscountClear - Callback when discount is cleared
 * @param {boolean} generatingSKU - Whether SKU is being generated
 * @param {function} onGenerateSKU - Callback to generate SKU
 * @param {boolean} improvingShortDescription - Whether short description is being improved
 * @param {function} onImproveShortDescription - Callback to improve short description
 * @param {boolean} improvingDescription - Whether description is being improved
 * @param {function} onImproveDescription - Callback to improve description
 * @param {function} onCalculatorClick - Callback when calculator button is clicked
 * @param {function} onScheduleClick - Callback when schedule button is clicked
 * @param {boolean} saving - Whether form is being saved
 */
const ProductDetailsPanel = ({
  // formData and errors removed from props

  productType,
  onProductTypeChange,
  categories = [],
  selectedDiscount,
  onDiscountSelect,
  onDiscountClear,
  generatingSKU = false,
  onGenerateSKU,
  improvingShortDescription = false,
  onImproveShortDescription,
  improvingDescription = false,
  onImproveDescription,
  onCalculatorClick,
  onScheduleClick,
  scheduleDates,
  saving = false,
}) => {
  const { t, isRTL } = useLanguage();
  const { register, watch, formState: { errors }, control } = useFormContext();
  const formData = watch(); // Watch all fields to pass down to sub-components
  const { Text } = Typography;

  const {
    handleFieldChange,
    handleRegularPriceChange,
    handleDiscountSelect,
    handleDiscountClear
  } = useProductPricing(onDiscountSelect, onDiscountClear);



  return (
    <Card

      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          gap: '0px',
          paddingLeft: '24px',
          paddingRight: '24px'
        }
      }}
    >
      <Space direction="vertical" size={32} style={{ width: '100%' }}>
        {/* Product Type */}
        <ProductTypeSelector
          productType={productType}
          onTypeChange={onProductTypeChange}
          disabled={saving}
        />

        {/* Product Name and SKU */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="product_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t('productName')}
                  type="text"
                  placeholder={"הכנס שם מוצר"}
                  error={errors.product_name?.message}
                  required
                  autoComplete="off"
                  testId="product-name-input"
                  size="lg"
                  allowSpecialChars={false}
                />
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Text strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px', textAlign: 'right' }}>
              {t('sku')}
            </Text>
            <div style={{ position: 'relative' }}>
              <Input
                id="input-sku"
                type="text"
                value={formData.sku || ''}
                onChange={(value) => handleFieldChange('sku', value.target.value)}
                placeholder={t('enterSKU') || 'Enter SKU'}
                size="lg"
                testId="sku-input"
                style={{ paddingLeft: '40px' }}
                allowSpecialChars={false}
              />
              <AntButton
                type="text"
                icon={
                  generatingSKU ? (
                    <LoadingOutlined spin />
                  ) : (
                    <BulbOutlined />
                  )
                }
                onClick={() => onGenerateSKU?.()}
                disabled={generatingSKU}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  color: generatingSKU ? '#bfbfbf' : '#1890ff'
                }}
                title={t('createWithAI') || 'צור בעזרת AI'}
              />
            </div>
          </Col>
        </Row>

        {/* Category */}
        <CategorySelector
          value={formData.categories || []}
          categories={categories}
          error={errors.categories?.message}
          onChange={(value) => handleFieldChange('categories', value)}
        />

        {/* Price Fields */}
        <PriceFields
          formData={formData}
          errors={errors}
          onRegularPriceChange={(value) => handleRegularPriceChange(value, selectedDiscount)}
          onSalePriceChange={(value) => handleFieldChange('sale_price', value)}
          onStockChange={(value) => handleFieldChange('stock_quantity', value)}
          onCalculatorClick={onCalculatorClick}
          onScheduleClick={onScheduleClick}
          scheduleDates={scheduleDates}
        />

        {/* Discount Selector - Only for Simple Products */}
        {productType === 'simple' && (
          <DiscountSelector
            selectedDiscount={selectedDiscount}
            regularPrice={formData.regular_price}
            onDiscountSelect={handleDiscountSelect}
            onClear={handleDiscountClear}
          />
        )}

        {/* Short Description */}
        <ShortDescriptionField
          value={formData.short_description || ''}
          onChange={(value) => handleFieldChange('short_description', value)}
          onImprove={() => onImproveShortDescription?.()}
          isImproving={improvingShortDescription}
        />

        {/* Description */}
        <DescriptionField
          value={formData.description || ''}
          onChange={(value) => handleFieldChange('description', value)}
          onImprove={() => onImproveDescription?.()}
          isImproving={improvingDescription}
          error={errors.description?.message}
        />
      </Space>
    </Card>
  );
};

export default memo(ProductDetailsPanel);
