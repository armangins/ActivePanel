import { LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Button, Flex, Typography, theme, Spin } from 'antd';

const { Text } = Typography;

/**
 * Component to display loading indicators for infinite scroll
 */
export const LoadMoreIndicator = ({
    hasNextPage,
    isFetchingNextPage,
    allProducts,
    totalProducts,
    onLoadMore,
    t
}) => {
    const { token } = theme.useToken();

    if (!hasNextPage && allProducts.length > 0) {
        return (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    backgroundColor: token.colorSuccessBg,
                    color: token.colorSuccessText,
                    borderRadius: token.borderRadiusLG
                }}>
                    <CheckCircleFilled style={{ fontSize: 20 }} />
                    <Text strong style={{ color: 'inherit' }}>
                        {t('allProductsLoaded') || 'All products loaded'} ({totalProducts})
                    </Text>
                </div>
            </div>
        );
    }

    if (!hasNextPage) {
        return null;
    }

    return (
        <Flex vertical align="center" gap="small" style={{ marginTop: 32 }}>
            {isFetchingNextPage ? (
                <Flex align="center" gap="small">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    <Text type="secondary">{t('loadingMore') || 'Loading more products...'}</Text>
                </Flex>
            ) : (
                <Button
                    onClick={onLoadMore}
                    size="large"
                    style={{ paddingLeft: 24, paddingRight: 24 }}
                >
                    {t('loadMore') || 'Load More Products'}
                </Button>
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>
                {t('showing')} {allProducts.length} {t('of')} {totalProducts}
            </Text>
        </Flex>
    );
};
