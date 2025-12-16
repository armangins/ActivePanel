import { memo } from 'react';
import { Radio, Typography } from 'antd';
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
  const typeOptions = [
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
  ];

  const handleTypeSelect = (e) => {
    const type = e.target.value;
    if (!disabled && productType !== type) {
      onTypeChange(type);
    }
  };

  const selectedOption = typeOptions.find(option => option.value === productType);

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
        .product-type-selector .ant-radio-group {
          display: flex !important;
          width: 100%;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #d9d9d9;
        }
        .product-type-selector .ant-radio-button-wrapper {
          flex: 1;
          text-align: center;
          border: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 6px 12px;
          height: 32px;
          line-height: 20px;
          font-size: 14px;
        }
        .product-type-selector .ant-radio-button-wrapper:not(:last-child) {
          border-right: 1px solid #d9d9d9 !important;
        }
        .product-type-selector .ant-radio-button-wrapper:first-child {
          border-top-left-radius: 6px !important;
          border-bottom-left-radius: 6px !important;
        }
        .product-type-selector .ant-radio-button-wrapper:last-child {
          border-top-right-radius: 6px !important;
          border-bottom-right-radius: 6px !important;
        }
        .product-type-selector .ant-radio-button-wrapper-checked {
          background-color: #1890ff !important;
          color: #fff !important;
          border-color: #1890ff !important;
        }
        .product-type-selector .ant-radio-button-wrapper-checked:not(:last-child) {
          border-right-color: #d9d9d9 !important;
        }
        .product-type-selector .ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked) {
          background-color: #fff !important;
          color: #000 !important;
        }
        .product-type-selector .ant-radio-button-wrapper-checked:hover {
          color: #fff !important;
        }
        .product-type-selector .ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked):hover {
          color: #1890ff !important;
        }
      `}</style>

      <div className="product-type-selector">
        <Radio.Group
          value={productType}
          onChange={handleTypeSelect}
          disabled={disabled}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          {typeOptions.map((option) => (
            <Radio.Button
              key={option.value}
              value={option.value}
            >
              {option.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

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
