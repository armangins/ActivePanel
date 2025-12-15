import { Select, Typography } from 'antd';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text } = Typography;

/**
 * CategorySelector Component
 * 
 * Dropdown for selecting product categories (multi-select).
 */
const CategorySelector = ({ value, categories, error, onChange }) => {
  const { t, isRTL } = useLanguage();

  const options = categories.map(cat => ({
    label: cat.name,
    value: cat.id
  }));

  const handleChange = (selectedIds) => {
    onChange(selectedIds);
  };

  return (
    <div style={{ width: '100%' }}>
      <div>
        <Text strong style={{
          display: 'block',
          marginBottom: 8,
          textAlign: 'right'
        }}>
          {t('category') || 'קטגוריה'}
        </Text>
      </div>
      <div>
        <Select
          mode="multiple"
          value={value}
          onChange={handleChange}
          placeholder={t('chooseCategory') || 'בחר קטגוריות'}
          style={{ width: '100%' }}
          size="large"
          options={options}
          status={error ? 'error' : ''}
          showSearch
          optionFilterProp="label"
          maxTagCount="responsive"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {error && (
          <Text type="danger" style={{
            fontSize: 12,
            marginTop: 4,
            display: 'block',
            textAlign: 'right'
          }}>
            {error}
          </Text>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
