import { Card, List, Button, Typography, Image } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardProduct } from '../types';

const { Text } = Typography;

interface TopProductsWidgetProps {
    products: DashboardProduct[];
}

export const TopProductsWidget = ({ products }: TopProductsWidgetProps) => {
    const { t } = useLanguage();

    // Safe fallback or check document direction if needed, but for now standard layout
    // We can rely on AntD's Layout direction support if configured globally
    // or just valid inline styles.

    return (
        <Card
            bordered={false}
            title={<Text strong style={{ fontSize: 18 }}>{t('topProducts') || 'Top Products'}</Text>}
            extra={
                <Button type="link" style={{ color: '#9ca3af' }}>
                    {t('viewAll') || 'View all'}
                </Button>
            }
            style={{ borderRadius: 12, height: '100%' }}
            bodyStyle={{ padding: '0 24px 24px 24px' }}
        >
            <List
                itemLayout="horizontal"
                dataSource={products}
                renderItem={(item) => (
                    <List.Item style={{ borderBottom: 'none', padding: '12px 0' }}>
                        <List.Item.Meta
                            avatar={
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    backgroundColor: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.images && item.images.length > 0 ? (
                                        <Image
                                            src={item.images[0].src}
                                            alt={item.name}
                                            width={48}
                                            height={48}
                                            preview={false}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: 20 }}>📦</div>
                                    )}
                                </div>
                            }
                            title={
                                <Text strong style={{ fontSize: 14 }}>
                                    {item.name}
                                </Text>
                            }
                            description={
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {item.total_sales} {t('items') || 'Items'}
                                </Text>
                            }
                            style={{ alignItems: 'center' }}
                        />
                        <div style={{ textAlign: 'end' }}>
                            <div style={{ marginBottom: 4 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                    {t('price') || 'Price'}
                                </Text>
                                <Text strong style={{ fontSize: 14 }}>
                                    ${parseFloat(item.price || '0').toFixed(2)}
                                </Text>
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );
};
