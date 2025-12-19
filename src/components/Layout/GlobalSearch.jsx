import React, { useState, useEffect } from 'react';
import { AutoComplete, Input, Typography, Flex, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProductsData } from '@/features/products/hooks/useProductsData';
import { useLanguage } from '../../contexts/LanguageContext';
import { OptimizedImage } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';

const { Text } = Typography;

const GlobalSearch = ({ placeholder, isRTL, className }) => {
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebounce(searchValue, 500);
    const [options, setOptions] = useState([]);
    const navigate = useNavigate();
    const { t, formatCurrency } = useLanguage();

    // Fetch products only when we have a search term
    const { data, isLoading } = useProductsData(
        { search: debouncedSearchValue, per_page: 5 },
        { enabled: !!debouncedSearchValue }
    );

    // Update options when data changes
    useEffect(() => {
        if (!debouncedSearchValue) {
            setOptions([]);
            return;
        }

        if (isLoading) {
            setOptions([{
                value: 'loading',
                label: (
                    <Flex justify="center" style={{ padding: '12px' }}>
                        <Spin size="small" />
                    </Flex>
                ),
                disabled: true
            }]);
            return;
        }

        if (data?.data?.length > 0) {
            const productOptions = data.data.map(product => ({
                value: product.id.toString(),
                label: (
                    <Flex align="center" gap={12} style={{ padding: '4px 0' }}>
                        <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 4, overflow: 'hidden' }}>
                            <OptimizedImage
                                src={product.images?.[0]?.src}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <Flex vertical flex={1} style={{ overflow: 'hidden' }}>
                            <Text strong ellipsis>{product.name}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatCurrency(product.regular_price || product.price)}
                            </Text>
                        </Flex>
                    </Flex>
                ),
                product: product // Keep full product data if needed
            }));
            setOptions(productOptions);
        } else {
            setOptions([{
                value: 'no-results',
                label: (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('noResults') || 'לא נמצאו תוצאות'}
                        style={{ margin: '8px 0' }}
                    />
                ),
                disabled: true
            }]);
        }
    }, [data, isLoading, debouncedSearchValue, formatCurrency, t]);

    const handleSelect = (value, option) => {
        if (option.product) {
            navigate(`/products/edit/${option.product.id}`);
            setSearchValue(''); // Clear search after selection
        }
    };

    return (
        <div className={`global-search ${className || ''}`} style={{ width: '100%', maxWidth: '400px' }}>
            <AutoComplete
                popupMatchSelectWidth={400}
                style={{ width: '100%' }}
                options={options}
                onSelect={handleSelect}
                onSearch={setSearchValue}
                value={searchValue}
                listHeight={400} // Ensure dropdown has enough height
            >
                <Input
                    size="large"
                    placeholder={placeholder || (t('search') || 'חיפוש...')}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    allowClear
                    style={{
                        borderRadius: '8px',
                        direction: isRTL ? 'rtl' : 'ltr'
                    }}
                />
            </AutoComplete>
        </div>
    );
};

export default GlobalSearch;
