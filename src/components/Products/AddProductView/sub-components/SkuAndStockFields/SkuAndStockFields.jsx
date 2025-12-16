import { Input, InputNumber, Select, Checkbox, Typography, Flex } from 'antd';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text } = Typography;

/**
 * SkuAndStockFields Component
 */
const SkuAndStockFields = ({
  formData,
  errors,
  onStockChange,
  onManageStockChange,
  onStockStatusChange
}) => {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stock Management */}
      <div>
        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Text strong>
            {formData.manage_stock ? (t('stockQuantity') || 'כמות במלאי') : (t('stockStatus') || 'סטטוס מלאי')}
            {formData.manage_stock && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
          </Text>
          <Checkbox
            checked={formData.manage_stock ?? true}
            onChange={(e) => onManageStockChange(e.target.checked)}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>{t('manageStock') || 'ניהול מלאי'}</Text>
          </Checkbox>
        </Flex>

        {formData.manage_stock ? (
          <>
            <InputNumber
              value={formData.stock_quantity}
              onChange={(val) => onStockChange(val)}
              placeholder="0"
              min={0}
              step={1}
              style={{ width: '100%' }}
              status={errors.stock_quantity ? 'error' : ''}
              data-testid="stock-quantity-input"
            />
            {errors.stock_quantity?.message && (
              <Text type="danger" style={{ fontSize: 12 }}>{errors.stock_quantity.message}</Text>
            )}
          </>
        ) : (
          <Select
            value={formData.stock_status || 'instock'}
            onChange={onStockStatusChange}
            style={{ width: '100%' }}
          >
            <Select.Option value="instock">{t('inStock') || 'במלאי'}</Select.Option>
            <Select.Option value="outofstock">{t('outOfStock') || 'אזל מהמלאי'}</Select.Option>
            <Select.Option value="onbackorder">{t('onBackorder') || 'הזמנה מראש'}</Select.Option>
          </Select>
        )}
      </div>
    </div>
  );
};

export default SkuAndStockFields;
