import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { Card } from '../../../../ui';
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
  saving = false,
}) => {
  const { t } = useLanguage();
  const { register, watch, formState: { errors } } = useFormContext();
  const formData = watch(); // Watch all fields to pass down to sub-components

  const {
    handleFieldChange,
    handleRegularPriceChange,
    handleDiscountSelect,
    handleDiscountClear
  } = useProductPricing(onDiscountSelect, onDiscountClear);



  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Product Type */}
        <ProductTypeSelector
          productType={productType}
          onTypeChange={onProductTypeChange}
          disabled={saving}
        />

        {/* Product Name */}
        <div>
          <Input
            label={t('productName')}
            type="text"
            placeholder={t('enterProductName') || 'Enter product name'}
            error={errors.product_name?.message}
            maxLength={20}
            required
            helperText={t('max20CharactersNote') || 'Do not exceed 20 characters when entering the product name.'}
            autoComplete="off"
            testId="product-name-input"
            {...register('product_name')}
          />
        </div>

        {/* Category */}
        <CategorySelector
          value={formData.categories?.[0]}
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
          onCalculatorClick={onCalculatorClick}
          onScheduleClick={onScheduleClick}
        />

        {/* Discount Selector */}
        <DiscountSelector
          selectedDiscount={selectedDiscount}
          regularPrice={formData.regular_price}
          onDiscountSelect={handleDiscountSelect}
          onClear={handleDiscountClear}
        />

        {/* SKU and Stock Quantity */}
        <SkuAndStockFields
          formData={formData}
          errors={errors}
          onSkuChange={(value) => handleFieldChange('sku', value)}
          onStockChange={(value) => handleFieldChange('stock_quantity', value)}
          onManageStockChange={(checked) => handleFieldChange('manage_stock', checked)}
          onStockStatusChange={(value) => handleFieldChange('stock_status', value)}
          onGenerateSKU={() => onGenerateSKU?.()}
          generatingSKU={generatingSKU}
        />

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
      </div>
    </Card>
  );
};

export default memo(ProductDetailsPanel);

