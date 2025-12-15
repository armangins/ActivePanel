import { useState, useEffect } from 'react';
import { Space, Typography, Button as AntButton, InputNumber } from 'antd';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Button } from '../../../../ui';

const { Text } = Typography;

/**
 * DiscountSelector Component
 * 
 * Allows user to select discount percentage (5, 10, 15, 20, 50%) or enter a custom value.
 */
const DiscountSelector = ({ selectedDiscount, regularPrice, onDiscountSelect, onClear }) => {
  const { t } = useLanguage();
  const [customValue, setCustomValue] = useState(null);

  const discountOptions = [5, 10, 15, 20, 50];

  // Check if regular price is entered (handle both string and number)
  const hasRegularPrice = regularPrice && String(regularPrice).trim() !== '' && parseFloat(regularPrice) > 0;

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustomValue(value);
    if (value && !isNaN(value) && value > 0 && value <= 100) {
      onDiscountSelect(value);
    }
  };

  // Clear custom value when selectedDiscount changes from outside
  useEffect(() => {
    if (selectedDiscount && customValue && selectedDiscount !== customValue.toString()) {
      setCustomValue(null);
    }
  }, [selectedDiscount, customValue]);

  return (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
        {t('selectDiscount') || 'בחר אחוז הנחה'}
      </Text>
      <Space size={24} align="center" wrap={false}>
        <Space size={12}>
          {discountOptions.map((discount) => (
            <Button
              key={discount}
              type="button"
              onClick={() => {
                onDiscountSelect(discount.toString());
                setCustomValue(null);
              }}
              variant={selectedDiscount === discount.toString() ? 'primary' : 'secondary'}
              size="lg"
              disabled={!hasRegularPrice}
            >
              {discount}%
            </Button>
          ))}
        </Space>

        <Space.Compact style={{ width: '160px' }}>
          <span style={{
            backgroundColor: '#f5f5f5',
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderLeft: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#595959',
            minWidth: '60px',
            whiteSpace: 'nowrap',
            opacity: !hasRegularPrice ? 0.5 : 1
          }}>
            מותאם
          </span>
          <InputNumber
            value={customValue}
            onChange={(value) => {
              setCustomValue(value);
              // Calculate discount if value is a valid number between 1 and 100
              if (value !== null && value !== undefined && !isNaN(value) && value >= 1 && value <= 100) {
                onDiscountSelect(value.toString());
              }
            }}
            placeholder="0"
            min={0}
            max={100}
            size="large"
            style={{ flex: 1, width: '100%' }}
            controls={false}
            disabled={!hasRegularPrice}
          />
        </Space.Compact>

        {selectedDiscount && (
          <AntButton
            type="primary"
            danger
            size="large"
            onClick={() => {
              onClear();
              setCustomValue('');
            }}
          >
            {t('clear') || 'נקה'}
          </AntButton>
        )}
      </Space>
    </div>
  );
};

export default DiscountSelector;
