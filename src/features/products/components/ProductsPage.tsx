import { useState, useCallback, useEffect, useRef } from 'react';
import { Layout, Input, Space, Button, Radio, Card, Flex, Modal, Spin, Typography } from 'antd';
import { ProductDetailModal } from './ProductDetails/ProductDetailModal';
import { SearchOutlined, AppstoreOutlined, BarsOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInfiniteProducts, useDeleteProduct, useBulkDeleteProducts } from '../hooks/useProductsData';
import { ProductGrid } from './ProductList/ProductGrid';
import { ProductTable } from './ProductList/ProductTable';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/features/settings';


const { Content } = Layout;
const { Text } = Typography;

export const ProductsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    // Debounce search to prevent excessive API calls
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
    const [viewProduct, setViewProduct] = useState<any>(null);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching
    } = useInfiniteProducts({
        per_page: 24, // Increased per page for better infinite scroll experience
        search: debouncedSearch
    });

    const products = data?.pages.flatMap(page => page.data) || [];


    const deleteMutation = useDeleteProduct();
    const bulkDeleteMutation = useBulkDeleteProducts();

    const loaderRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <Content style={{ padding: '16px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Flex wrap="wrap" gap={16} justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <Input
                    placeholder={t('searchProducts')}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    suffix={isFetching && search ? <LoadingOutlined style={{ color: '#1890ff' }} /> : null}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={() => setDebouncedSearch(search)}
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

            <Flex vertical flex={1}>
                {viewMode === 'grid' ? (
                    <ProductGrid
                        products={products}
                        isLoading={isLoading}
                        onView={(p) => setViewProduct(p)}
                        onEdit={(p) => navigate(`/products/edit/${p.id}`)}
                        onDelete={handleDelete}
                    />
                ) : (
                    <Card bodyStyle={{ padding: 0 }}>
                        <ProductTable
                            products={products}
                            isLoading={isLoading}
                            onView={(p) => setViewProduct(p)}
                            onEdit={(p) => navigate(`/products/edit/${p.id}`)}
                            onDelete={handleDelete}
                            selectedProductIds={selectedProductIds}
                            onSelectionChange={setSelectedProductIds}
                        />
                    </Card>
                )}

                {/* Loading State & Sentinel */}
                <div
                    ref={loaderRef}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '24px',
                        marginTop: 'auto',
                        width: '100%'
                    }}
                >
                    {(isLoading || isFetchingNextPage) && (
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    )}
                    {!hasNextPage && products.length > 0 && !isLoading && (
                        <Text type="secondary">{t('noMoreProducts')}</Text>
                    )}
                    {!isLoading && products.length === 0 && (
                        <Text>{t('noProductsFound')}</Text>
                    )}
                </div>
            </Flex>

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
