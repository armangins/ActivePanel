import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Layout, Button, Card, Flex, Modal, Spin, Typography, Segmented, FloatButton } from 'antd';
import { ProductDetailModal } from './ProductDetails/ProductDetailModal/ProductDetailModal';
import { AppstoreOutlined, BarsOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useInfiniteProducts, useDeleteProduct, useBulkDeleteProducts } from '../hooks/useProductsData';
import { ProductGrid } from './ProductList/ProductGrid';
import { ProductTable } from './ProductList/ProductTable';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettings } from '@/features/settings';

const { Content } = Layout;
const { Text } = Typography;

export const ProductsPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMobile } = useResponsive();
    const { settings, loading: settingsLoading } = useSettings();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

    // URL-based Modal State
    const isCreateMode = searchParams.get('create') === 'true';
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        error,
        isError
    } = useInfiniteProducts({
        per_page: 24,
    });

    useEffect(() => {
        if (isError && error) {
            console.error('ProductsPage: Error fetching products:', error);
        }
    }, [isError, error]);

    const products = useMemo(() => {
        const allProducts = data?.pages.flatMap(page => page.data) || [];
        const uniqueProducts = new Map();
        allProducts.forEach(p => {
            if (p && p.id) {
                uniqueProducts.set(p.id, p);
            }
        });
        return Array.from(uniqueProducts.values());
    }, [data]);

    // Derive product to edit from URL and available data
    const productToEdit = useMemo(() => {
        if (!editId) return null;
        const id = parseInt(editId, 10);
        return products.find(p => p.id === id) || { id };
    }, [editId, products]);

    const handleCloseModal = useCallback(() => {
        setSearchParams(params => {
            const newParams = new URLSearchParams(params);
            newParams.delete('create');
            newParams.delete('edit');
            return newParams;
        });
    }, [setSearchParams]);

    const handleOpenCreate = useCallback(() => {
        setSearchParams(params => {
            const newParams = new URLSearchParams(params);
            newParams.set('create', 'true');
            newParams.delete('edit');
            return newParams;
        });
    }, [setSearchParams]);

    const handleOpenEdit = useCallback((product: any) => {
        setSearchParams(params => {
            const newParams = new URLSearchParams(params);
            newParams.set('edit', String(product.id));
            newParams.delete('create');
            return newParams;
        });
    }, [setSearchParams]);


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

    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    useEffect(() => {
        console.log('ProductsPage: Settings state:', { settings, settingsLoading, isConfigured });
    }, [settings, settingsLoading, isConfigured]);

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

    if (settingsLoading) {
        return (
            <Flex justify="center" align="center" vertical gap="middle" style={{ minHeight: '60vh' }}>
                <Spin size="large" />
                <div>{t('loading') || 'טוען הגדרות...'}</div>
            </Flex>
        );
    }

    if (!isConfigured) {
        return (
            <Content style={{ padding: 24 }}>
                <Card>
                    <Flex vertical align="center" gap={16} style={{ padding: '40px 0' }}>
                        <Text strong style={{ fontSize: 18 }}>{t('setupRequired') || 'WooCommerce Setup Required'}</Text>
                        <Text type="secondary">{t('configureSettingsToViewProducts') || 'Please connect your store in settings to manage products.'}</Text>
                        <Button type="primary" onClick={() => navigate('/settings')}>
                            {t('goToSettings') || 'Go to Settings'}
                        </Button>
                    </Flex>
                </Card>
            </Content>
        );
    }

    return (
        <Content style={{
            padding: isMobile ? '4px' : '8px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>

            <Flex wrap="wrap" gap={16} align="center" style={{ marginBottom: 16, width: '100%', justifyContent: isMobile ? 'normal' : 'flex-end' }}>
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
                    onClick={handleOpenCreate}
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
                        onView={handleOpenEdit}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    <Card bodyStyle={{ padding: 0 }}>
                        <ProductTable
                            products={products}
                            isLoading={isLoading}
                            onView={handleOpenEdit}
                            onEdit={handleOpenEdit}
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
                        padding: 0,
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

            {/* Product Details Modal (Unified for Add/Edit) */}
            <ProductDetailModal
                product={productToEdit as any}
                open={isEditMode || isCreateMode}
                onClose={handleCloseModal}
                onEdit={(p) => handleOpenEdit(p)}
            />

            {/* Mobile Float Button */}
            {isMobile && (
                <FloatButton
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
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

