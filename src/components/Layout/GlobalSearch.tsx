import React, { useState, useEffect, useMemo } from 'react';
import { AutoComplete, Input, Typography, Flex, Spin, Empty, Button, Tooltip, theme } from 'antd';
import { SearchOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '@/features/products';
import { useLanguage } from '@/contexts/LanguageContext';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductDetailModal } from '@/features/products/components/ProductDetails/ProductDetailModal';
import type { DefaultOptionType } from 'antd/es/select';

const { Text } = Typography;
const { useToken } = theme;

interface Product {
    id: number;
    name: string;
    sku?: string;
    price?: string;
    regular_price?: string;
    images?: { src: string }[];
}

interface CustomOptionType extends DefaultOptionType {
    product?: Product;
}

interface GlobalSearchProps {
    placeholder?: string;
    isRTL?: boolean;
    className?: string;
    style?: React.CSSProperties;
    autoFocus?: boolean;
}

/**
 * GlobalSearch Component
 * 
 * Provides a global search inputs with autocomplete functionality for products.
 */
const GlobalSearch: React.FC<GlobalSearchProps> = ({ placeholder, isRTL, className, style, autoFocus }) => {
    const { token } = useToken();
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebounce(searchValue, 500);
    const [options, setOptions] = useState<CustomOptionType[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const navigate = useNavigate();
    const { t, formatCurrency } = useLanguage();

    // Client-side search for partial SKU matching
    const { search, isLoading } = useProductSearch();

    // Perform search on the client side using useMemo to avoid effect loops
    const searchResults = useMemo(() => {
        if (!debouncedSearchValue) return [];
        return search(debouncedSearchValue);
    }, [debouncedSearchValue, search]);

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

        if (searchResults?.length > 0) {
            // Data is already sorted by useProductSearch hook
            const sortedProducts = searchResults;

            const productOptions: CustomOptionType[] = sortedProducts.map((product: Product) => ({
                value: product.id.toString(),
                label: (
                    <Flex align="center" gap={12} style={{ padding: '4px 0' }}>
                        <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 4, overflow: 'hidden' }}>
                            <OptimizedImage
                                src={product.images?.[0]?.src || ''}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <Flex vertical flex={1} style={{ overflow: 'hidden' }}>
                            <Text strong ellipsis>{product.name}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                <span>{product.sku ? `SKU: ${product.sku} | ` : ''}</span>
                                {formatCurrency(product.regular_price || product.price || '')}
                            </Text>
                        </Flex>
                        <Flex gap={4}>
                            <Tooltip title={t('viewDetails') || 'View Details'}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<InfoCircleOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProduct(product);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title={t('edit') || 'Edit'}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/products/edit/${product.id}`);
                                        setSearchValue('');
                                    }}
                                />
                            </Tooltip>
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
    }, [searchResults, isLoading, debouncedSearchValue, formatCurrency, t, navigate]);

    const handleSelect = (value: string, option: CustomOptionType) => {
        if (option.product) {
            navigate(`/products/edit/${option.product.id}`);
            setSearchValue(''); // Clear search after selection
        }
    };

    return (
        <>
            <div className={`global-search ${className || ''}`} style={{ width: '100%', maxWidth: '400px', ...style }}>
                <AutoComplete
                    popupMatchSelectWidth={400}
                    style={{ width: '100%' }}
                    options={options}
                    onSelect={handleSelect}
                    onSearch={setSearchValue}
                    value={searchValue}
                // listHeight={400} // Removed: AntD handles this well by default, or use if strictly needed
                >
                    <Input
                        size="large"
                        placeholder={placeholder || (t('search') || 'חיפוש...')}
                        prefix={<SearchOutlined style={{ color: token.colorTextDisabled, fontSize: 18 }} />}
                        autoFocus={autoFocus}
                        allowClear
                        style={{
                            borderRadius: token.borderRadiusLG,
                            direction: isRTL ? 'rtl' : 'ltr'
                        }}
                    />
                </AutoComplete>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    open={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onEdit={(product: Product) => {
                        navigate(`/products/edit/${product.id}`);
                        setSelectedProduct(null);
                        setSearchValue('');
                    }}
                />
            )}
        </>
    );
};

export default GlobalSearch;
