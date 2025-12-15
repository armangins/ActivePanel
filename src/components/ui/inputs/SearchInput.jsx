import { Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * SearchInput Component - Ant Design wrapper
 * 
 * Reusable search input component using Space.Compact to avoid deprecation warnings.
 */
const SearchInput = ({ 
  value, 
  onChange, 
  onFocus,
  onSearch,
  placeholder = 'Search...', 
  isRTL = true,
  className = '',
  allowClear = true
}) => {
  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Space.Compact style={{ width: '100%', direction: isRTL ? 'rtl' : 'ltr' }} className={className}>
      <Input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={onFocus}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        allowClear={allowClear}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      />
      <Button 
        type="primary" 
        icon={<SearchOutlined />}
        onClick={handleSearch}
      />
    </Space.Compact>
  );
};

export default SearchInput;
