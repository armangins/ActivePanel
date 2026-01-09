import React from 'react';
import { Card, Row, Col, Input, Select, InputNumber, Button, Form, theme } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ProductFilterValues {
    search: string;
    category?: number;
    type?: string;
    stock_status?: string;
    min_price?: number;
    max_price?: number;
}

interface ProductFiltersProps {
    filters: ProductFilterValues;
    onFilterChange: (filters: ProductFilterValues) => void;
    categories: { id: number; name: string }[];
    isLoading?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
    filters,
    onFilterChange,
    categories,
    isLoading
}) => {
    const { t, isRTL } = useLanguage();
    const { token } = theme.useToken();
    const [form] = Form.useForm();

    // Sync form with filters prop
    React.useEffect(() => {
        form.setFieldsValue(filters);
    }, [filters, form]);

    const handleValuesChange = (_: any, allValues: any) => {
        onFilterChange(allValues);
    };

    const handleClear = () => {
        const resetValues = {
            search: '',
            category: undefined,
            type: undefined,
            stock_status: undefined,
            min_price: undefined,
            max_price: undefined
        };
        form.setFieldsValue(resetValues);
        onFilterChange(resetValues);
    };

    return (
        <Card
            bordered={false}
            styles={{ body: { padding: '24px 24px 0 24px' } }} // AntD v5 style prop
            style={{
                marginBottom: 16,
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadiusLG
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={filters}
            >
                <Row gutter={[16, 0]}>
                    {/* Search */}
                    <Col xs={24} md={8} lg={6}>
                        <Form.Item name="search" label={t('search') || 'Search'}>
                            <Input
                                placeholder={t('searchProducts') || 'Product name, SKU...'}
                                prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    {/* Category */}
                    <Col xs={24} md={8} lg={4}>
                        <Form.Item name="category" label={t('category') || 'Category'}>
                            <Select
                                placeholder={t('allCategories') || 'All Categories'}
                                allowClear
                                options={categories.map(c => ({ label: c.name, value: c.id }))}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>

                    {/* Product Type */}
                    <Col xs={24} md={8} lg={4}>
                        <Form.Item name="type" label={t('productType') || 'Product Type'}>
                            <Select
                                placeholder={t('allTypes') || 'All Types'}
                                allowClear
                                options={[
                                    { label: t('simple') || 'Simple', value: 'simple' },
                                    { label: t('variable') || 'Variable', value: 'variable' },
                                    { label: t('grouped') || 'Grouped', value: 'grouped' },
                                    { label: t('external') || 'External', value: 'external' },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    {/* Stock Status */}
                    <Col xs={24} md={8} lg={4}>
                        <Form.Item name="stock_status" label={t('stockStatus') || 'Stock Status'}>
                            <Select
                                placeholder={t('anyStatus') || 'Any Status'}
                                allowClear
                                options={[
                                    { label: t('inStock') || 'In Stock', value: 'instock' },
                                    { label: t('outOfStock') || 'Out of Stock', value: 'outofstock' },
                                    { label: t('onBackorder') || 'On Backorder', value: 'onbackorder' },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    {/* Price Range */}
                    <Col xs={24} md={12} lg={6}>
                        <Form.Item label={t('priceRange') || 'Price Range'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Form.Item name="min_price" noStyle>
                                    <InputNumber
                                        placeholder={t('min') || 'Min'}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <span style={{ color: token.colorTextDescription }}>-</span>
                                <Form.Item name="max_price" noStyle>
                                    <InputNumber
                                        placeholder={t('max') || 'Max'}
                                        min={0}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>
                    </Col>

                    {/* Clear Filters Button (aligned with inputs) */}
                    <Col xs={24} style={{ textAlign: isRTL ? 'left' : 'right', marginBottom: 24 }}>
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClear}
                            disabled={isLoading}
                        >
                            {t('clearFilters') || 'Clear Filters'}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};
