import { useState, useCallback, useEffect, useRef } from 'react';
import { Layout, Button, Card, Flex, Modal, Spin, Typography, Segmented, FloatButton } from 'antd';
import { ProductDetailModal } from './ProductDetails/ProductDetailModal';
import { AppstoreOutlined, BarsOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useInfiniteProducts, useDeleteProduct, useBulkDeleteProducts } from '../hooks/useProductsData';
import { ProductGrid } from './ProductList/ProductGrid';
import { ProductTable } from './ProductList/ProductTable';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/features/settings';


const { Content } = Layout;
const { Text } = Typography;

// ... existing imports

export const ProductsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isMobile } = useResponsive();
    const { settings } = useSettings();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
    const [viewProduct, setViewProduct] = useState<any>(null);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteProducts({
        per_page: 24, // Increased per page for better infinite scroll experience
        search: ''
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
            content: t('deleteProductWarning').replace('{productName}', product.name),
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
        <Content style={{
            padding: isMobile ? '4px 6px' : '16px 24px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>

            <Flex wrap="wrap" gap={16} align="center" style={{ marginBottom: 24, width: '100%', justifyContent: isMobile ? 'normal' : 'flex-end' }}>
                {selectedProductIds.size > 0 && (
                    <Button danger onClick={handleBulkDelete}>
                        {t('deleteSelected')} ({selectedProductIds.size})
                    </Button>
                )}
                <Segmented
                    size="large"
                    value={viewMode}
                    onChange={(value) => setViewMode(value as 'grid' | 'list')}
                    options={[
                        {
                            value: 'grid',
                            icon: <AppstoreOutlined />,
                        },
                        {
                            value: 'list',
                            icon: <BarsOutlined />,
                        },
                    ]}
                />

                {/* Spacer to push button to the left on mobile (RTL End) */}
                {isMobile && <div style={{ flex: 1 }} />}

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/products/add')}
                    shape={isMobile ? "circle" : "default"}
                    style={isMobile ? { minWidth: 40, width: 40, height: 40, padding: 0 } : undefined}
                >
                    {!isMobile && t('addProduct')}
                </Button>
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
                        padding: isMobile ? '0px' : '24px',
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

            {/* Mobile Float Button */}
            {isMobile && (
                <FloatButton
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/products/add')}
                    style={{
                        bottom: 24,
                        right: 24,
                        width: 50,
                        height: 50,
                        minWidth: 50, // Ensure it doesn't shrink
                        borderRadius: '50%' // Force circle
                    }}
                />
            )}
        </Content>
    );
};

