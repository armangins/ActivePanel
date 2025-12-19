import { Card, Row, Col, Typography, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Product } from '../../types';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriceDisplay } from './PriceDisplay';

const { Meta } = Card;
const { Text } = Typography;

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export const ProductGrid = ({
    products,
    isLoading = false,
    onView,
    onEdit,
    onDelete
}: ProductGridProps) => {
    const { t } = useLanguage();

    if (isLoading) {
        // Skeleton loading could be added here
        return <div>{t('loading')}</div>;
    }

    return (
        <Row gutter={[16, 16]}>
            {products.map((product) => {
                const imageUrl = product.images?.[0]?.src;
                const stockStatus = product.stock_status || 'instock';

                return (
                    <Col
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        xl={6}
                        xxl={4.8}
                        key={product.id}
                    >
                        <Card
                            hoverable
                            cover={
                                <img
                                    alt={product.name}
                                    src={imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f2f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="48" fill="%23bfbfbf"%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E'}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        objectFit: 'cover'
                                    }}
                                />
                            }
                            actions={[
                                <EyeOutlined key="view" onClick={() => onView(product)} />,
                                <EditOutlined key="edit" onClick={() => onEdit(product)} />,
                                <DeleteOutlined key="delete" onClick={() => onDelete(product)} />
                            ]}
                        >
                            <Meta
                                title={<Text ellipsis>{product.name}</Text>}
                                description={
                                    <>
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <PriceDisplay
                                                price={product.price}
                                                regular_price={product.regular_price}
                                                sale_price={product.sale_price}
                                                price_html={product.price_html}
                                                currency={product.currency}
                                                type={product.type}
                                            />
                                            <Tag color={stockStatus === 'instock' ? 'success' : 'error'}>
                                                {stockStatus === 'instock' ? t('inStock') : t('outOfStock')}
                                            </Tag>
                                        </Space>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                            SKU: {product.sku || '-'}
                                        </Text>
                                    </>
                                }
                            />
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};
