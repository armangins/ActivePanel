import { useState, useCallback } from 'react';
import { Layout, Input, Space, Button, Radio, Card, Pagination, Flex, Modal } from 'antd';
import { ProductDetailModal } from './ProductDetails/ProductDetailModal';
import { SearchOutlined, AppstoreOutlined, BarsOutlined, PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProductsData, useDeleteProduct, useBulkDeleteProducts } from '../hooks/useProductsData';
import { ProductGrid } from './ProductList/ProductGrid';
import { ProductTable } from './ProductList/ProductTable';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/features/settings';

const { Content } = Layout;

export const ProductsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
    const [viewProduct, setViewProduct] = useState<any>(null);

    const { data, isLoading } = useProductsData({
        page,
        per_page: 12,
        search
    });

    const deleteMutation = useDeleteProduct();
    const bulkDeleteMutation = useBulkDeleteProducts();

    const handleDelete = useCallback((product: any) => {
        Modal.confirm({
            title: t('deleteProduct'),
            content: `${t('areYouSureDelete')} "${product.name}"?`,
            okText: t('yes'),
            okType: 'danger',
            cancelText: t('no'),
            onOk: async () => {
                await deleteMutation.mutateAsync(product.id);
            }
        });
    }, [t, deleteMutation]);

    const handleBulkDelete = useCallback(() => {
        Modal.confirm({
            title: t('bulkDelete'),
            content: `${t('areYouSureDelete')} ${selectedProductIds.size} ${t('products')}?`,
            okText: t('yes'),
            okType: 'danger',
            cancelText: t('no'),
            onOk: async () => {
                await bulkDeleteMutation.mutateAsync(Array.from(selectedProductIds));
                setSelectedProductIds(new Set());
            }
        });
    }, [t, selectedProductIds, bulkDeleteMutation]);

    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    if (!isConfigured) return <div>{t('setupRequired')}</div>;

    return (
        <Content style={{ padding: '16px 24px', minHeight: 280 }}>
            <Flex wrap="wrap" gap={16} justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <Input
                    placeholder={t('searchProducts')}
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                    style={{ width: '100%', maxWidth: 300, minWidth: 200 }}
                />
                <Space wrap>
                    {selectedProductIds.size > 0 && (
                        <Button danger onClick={handleBulkDelete}>
                            {t('deleteSelected')} ({selectedProductIds.size})
                        </Button>
                    )}
                    <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
                        <Radio.Button value="list"><BarsOutlined /></Radio.Button>
                    </Radio.Group>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/add')}>
                        {t('addProduct')}
                    </Button>
                </Space>
            </Flex>

            {viewMode === 'grid' ? (
                <ProductGrid
                    products={data?.data || []}
                    isLoading={isLoading}
                    onView={(p) => setViewProduct(p)}
                    onEdit={(p) => navigate(`/products/edit/${p.id}`)}
                    onDelete={handleDelete}
                />
            ) : (
                <Card bodyStyle={{ padding: 0 }}>
                    <ProductTable
                        products={data?.data || []}
                        isLoading={isLoading}
                        onView={(p) => setViewProduct(p)}
                        onEdit={(p) => navigate(`/products/edit/${p.id}`)}
                        onDelete={handleDelete}
                        selectedProductIds={selectedProductIds}
                        onSelectionChange={setSelectedProductIds}
                    />
                </Card>
            )}

            {data && data.total > 0 && (
                <Flex justify="center" style={{ marginTop: 24 }}>
                    <Pagination
                        current={page}
                        total={data.total}
                        pageSize={12}
                        onChange={setPage}
                        showSizeChanger={false}
                        responsive
                    />
                </Flex>
            )}

            {/* Product Details Modal */}
            <ProductDetailModal
                product={viewProduct}
                open={!!viewProduct}
                onClose={() => setViewProduct(null)}
                onEdit={(p) => navigate(`/products/edit/${p.id}`)}
            />
        </Content>
    );
};
