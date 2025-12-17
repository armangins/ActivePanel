import { memo, useMemo, useCallback } from 'react';
import { Segmented, Typography } from 'antd';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text } = Typography;

/**
 * ProductTypeSelector Component
 * 
 * A smart and dynamic product type selector that allows users to choose
 * between 'simple' and 'variable' product types.
 * 
 * @param {string} productType - Currently selected type: 'simple' or 'variable'
 * @param {function} onTypeChange - Callback function when type changes (receives: 'simple' | 'variable')
 * @param {boolean} disabled - Whether the selector is disabled (default: false)
 * @param {string} className - Additional CSS classes for the container
 * @param {boolean} showHelpText - Whether to show the help text below (default: true)
 */
const ProductTypeSelector = ({
  productType,
  onTypeChange,
  disabled = false,
  className = '',
  showHelpText = true,
}) => {
  const { t } = useLanguage();

  // Product type options configuration
  const typeOptions = useMemo(() => [
    {
      value: 'simple',
      label: t('simple') || 'פשוט',
      helpText: t('simpleProductDescFull') || 'מוצר פשוט עם מחיר ומלאי יחיד. מתאים למוצרים ללא אפשרויות שונות.',
    },
    {
      value: 'variable',
      label: t('variable') || 'משתנה',
      helpText: t('variableProductDescFull') || 'מוצר משתנה מאפשר יצירת וריאציות שונות (גודל, צבע וכו\')  <br/> עם מחירים ומלאי שונים לכל וריאציה.',
    },
  ], [t]);

  const handleTypeChange = useCallback((value) => {
    if (!disabled && productType !== value) {
      onTypeChange(value);
    }
  }, [disabled, productType, onTypeChange]);

  const selectedOption = useMemo(() =>
    typeOptions.find(option => option.value === productType),
    [typeOptions, productType]
  );

  // Format options for Segmented component
  const segmentedOptions = useMemo(() => typeOptions.map(option => ({
    label: option.label,
    value: option.value,
  })), [typeOptions]);

  return (
    <div className={className}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '8px',
        textAlign: 'right'
      }}>
        {t('productType') || 'סוג מוצר'} <span style={{ color: '#f97316' }}>*</span>
      </label>

      <style>{`
        .product-type-segmented .ant-segmented-item-selected {
          background-color: #1890ff !important;
          color: #fff !important;
        }
        .product-type-segmented .ant-segmented-item-selected:hover {
          color: #fff !important;
        }
        .product-type-segmented .ant-segmented-thumb {
          background-color: #1890ff !important;
        }
      `}</style>

      <Segmented
        className="product-type-segmented"
        block
        options={segmentedOptions}
        value={productType}
        onChange={handleTypeChange}
        disabled={disabled}
        size="large"
      />

      {showHelpText && selectedOption && (
        <Text
          type="secondary"
          style={{
            fontSize: '12px',
            marginTop: '8px',
            display: 'block',
            textAlign: 'right'
          }}
        >
          {selectedOption.helpText.split('<br/>').map((line, index, array) => (
            <span key={index}>
              {line}
              {index < array.length - 1 && <br />}
            </span>
          ))}
        </Text>
      )}
    </div>
  );
};

export default memo(ProductTypeSelector);
