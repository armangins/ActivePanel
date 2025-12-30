import { Modal, Spin, Card, Row, Col, Typography, List, Avatar, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useOrderDetail } from '../hooks/useOrdersData';
import { useLanguage } from '@/contexts/LanguageContext';

const { Title, Text } = Typography;

interface OrderDetailsModalProps {
    orderId: number | null;
    onClose: () => void;
}

export const OrderDetailsModal = ({ orderId, onClose }: OrderDetailsModalProps) => {
    const { t, formatCurrency } = useLanguage();
    const { data: order, isLoading } = useOrderDetail(orderId);

    if (!orderId) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <Modal
            open={!!orderId}
            onCancel={onClose}
            width={1100}
            footer={null}
            title={null}
            styles={{ body: { padding: 0 } }}
        >
            {isLoading || !order ? (
                <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
            ) : (
                <Row gutter={0} style={{ minHeight: 500 }}>
                    {/* Left Side - Items List */}
                    <Col xs={24} lg={16} style={{
                        padding: 24,
                        borderRight: '1px solid #f0f0f0',
                        backgroundColor: '#fafafa'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 24
                        }}>
                            <Title level={5} style={{ margin: 0 }}>
                                {t('allItems') || 'All Item'}
                            </Title>
                        </div>

                        <List
                            dataSource={order.line_items}
                            renderItem={(item: any) => (
                                <List.Item style={{
                                    backgroundColor: '#fff',
                                    padding: '20px 16px',
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    border: '1px solid #f0f0f0'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        gap: 16
                                    }}>
                                        <Avatar
                                            shape="square"
                                            size={64}
                                            src={item.image?.src}
                                            icon={<InboxOutlined />}
                                            style={{ borderRadius: 8, flexShrink: 0 }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                                {t('productName') || 'Product name'}
                                            </Text>
                                            <Text strong style={{ fontSize: 15 }}>{item.name}</Text>
                                        </div>
                                        <div style={{ width: 100, textAlign: 'center' }}>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                                {t('quantity') || 'Quantity'}
                                            </Text>
                                            <Text style={{ fontSize: 15 }}>{item.quantity}</Text>
                                        </div>
                                        <div style={{ width: 120, textAlign: 'right' }}>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                                {t('price') || 'Price'}
                                            </Text>
                                            <Text strong style={{ fontSize: 15 }}>
                                                {formatCurrency(parseFloat(item.total))}
                                            </Text>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />

                        {/* Cart Totals */}
                        <Card
                            title={<Text strong>{t('cartTotals') || 'Cart Totals'}</Text>}
                            style={{ marginTop: 24 }}
                            size="small"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>{t('subtotal') || 'Subtotal'}:</Text>
                                    <Text strong>
                                        {formatCurrency(order.line_items.reduce((acc, item) => acc + parseFloat(item.total), 0))}
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>{t('shipping') || 'Shipping'}:</Text>
                                    <Text strong>{formatCurrency(parseFloat(order.shipping_total))}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>{t('tax') || 'Tax (GST)'}:</Text>
                                    <Text strong>{formatCurrency(parseFloat(order.total_tax))}</Text>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 12,
                                    borderTop: '1px solid #f0f0f0',
                                    marginTop: 4
                                }}>
                                    <Text strong>{t('totalPrice') || 'Total price'}:</Text>
                                    <Text strong style={{ fontSize: 16, color: '#ff6b35' }}>
                                        {formatCurrency(parseFloat(order.total))}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Right Side - Summary */}
                    <Col xs={24} lg={8} style={{ padding: 24, backgroundColor: '#fff' }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            {/* Summary Card */}
                            <Card size="small" title={<Text strong>{t('summary') || 'Summary'}</Text>}>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {t('orderId') || 'Order ID'}
                                        </Text>
                                        <div><Text strong>#{order.id}</Text></div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {t('date') || 'Date'}
                                        </Text>
                                        <div><Text>{formatDate(order.date_created)}</Text></div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {t('total') || 'Total'}
                                        </Text>
                                        <div>
                                            <Text strong style={{ color: '#ff6b35' }}>
                                                {formatCurrency(parseFloat(order.total))}
                                            </Text>
                                        </div>
                                    </div>
                                </Space>
                            </Card>

                            {/* Shipping Address Card */}
                            <Card size="small" title={<Text strong>{t('shippingAddress') || 'Shipping Address'}</Text>}>
                                <Text style={{ fontSize: 13 }}>
                                    {order.shipping?.address_1} {order.shipping?.address_2 && `, ${order.shipping.address_2}`}
                                    {order.shipping?.city && `, ${order.shipping.city}`}
                                    {order.shipping?.state && `, ${order.shipping.state}`} {order.shipping?.postcode}
                                </Text>
                            </Card>

                            {/* Payment Method Card */}
                            <Card size="small" title={<Text strong>{t('paymentMethod') || 'Payment Method'}</Text>}>
                                <Text style={{ fontSize: 13 }}>{order.payment_method_title}</Text>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            )}
        </Modal>
    );
};
