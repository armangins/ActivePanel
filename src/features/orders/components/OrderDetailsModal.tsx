import { Modal, Spin, Card, Row, Col, Typography, Descriptions, List, Tag, Table, Avatar, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useOrderDetail } from '../hooks/useOrdersData';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '../types';

const { Title, Text } = Typography;

interface OrderDetailsModalProps {
    orderId: number | null;
    onClose: () => void;
}

export const OrderDetailsModal = ({ orderId, onClose }: OrderDetailsModalProps) => {
    const { t, formatCurrency } = useLanguage();
    const { data: order, isLoading } = useOrderDetail(orderId);

    if (!orderId) return null;

    const columns = [
        {
            title: t('product'),
            key: 'product',
            render: (_: any, item: any) => (
                <Space>
                    <Avatar shape="square" src={item.image?.src} icon={<InboxOutlined />} />
                    <Space direction="vertical" size={0}>
                        <Text strong>{item.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>SKU: {item.sku}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: t('quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center' as const,
        },
        {
            title: t('total'),
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
            render: (val: string) => formatCurrency(parseFloat(val))
        }
    ];

    const renderBilling = () => (
        <Descriptions title={t('billingAddress')} column={1} size="small">
            <Descriptions.Item label={t('name')}>
                {order?.billing?.first_name} {order?.billing?.last_name}
            </Descriptions.Item>
            <Descriptions.Item label={t('email')}>
                {order?.billing?.email}
            </Descriptions.Item>
            <Descriptions.Item label={t('phone')}>
                {order?.billing?.phone}
            </Descriptions.Item>
            <Descriptions.Item label={t('address')}>
                {order?.billing?.address_1} {order?.billing?.address_2},<br />
                {order?.billing?.city}, {order?.billing?.state} {order?.billing?.postcode}<br />
                {order?.billing?.country}
            </Descriptions.Item>
        </Descriptions>
    );

    const renderShipping = () => (
        <Descriptions title={t('shippingAddress')} column={1} size="small">
            <Descriptions.Item label={t('name')}>
                {order?.shipping?.first_name} {order?.shipping?.last_name}
            </Descriptions.Item>
            <Descriptions.Item label={t('address')}>
                {order?.shipping?.address_1} {order?.shipping?.address_2},<br />
                {order?.shipping?.city}, {order?.shipping?.state} {order?.shipping?.postcode}<br />
                {order?.shipping?.country}
            </Descriptions.Item>
        </Descriptions>
    );

    return (
        <Modal
            open={!!orderId}
            onCancel={onClose}
            width={1000}
            footer={null}
            title={
                <Space>
                    <Title level={4} style={{ margin: 0 }}>{t('order')} #{orderId}</Title>
                    {order && <Tag color={order.status === 'completed' ? 'success' : 'processing'}>{order.status}</Tag>}
                </Space>
            }
        >
            {isLoading || !order ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card title={t('items')} bordered={false}>
                            <Table
                                dataSource={order.line_items}
                                columns={columns} // @ts-ignore
                                pagination={false}
                                rowKey="id"
                            />
                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                <Descriptions column={1} style={{ width: 300 }}>
                                    <Descriptions.Item label={t('subtotal')}>
                                        {formatCurrency(order.line_items.reduce((acc, item) => acc + parseFloat(item.total), 0))}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t('shipping')}>
                                        {formatCurrency(parseFloat(order.shipping_total))}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t('tax')}>
                                        {formatCurrency(parseFloat(order.total_tax))}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<Text strong>{t('total')}</Text>}>
                                        <Text strong style={{ fontSize: 18 }}>{formatCurrency(parseFloat(order.total))}</Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Card bordered={false}>
                                {renderBilling()}
                            </Card>
                            <Card bordered={false}>
                                {renderShipping()}
                            </Card>
                            <Card title={t('payment')} bordered={false}>
                                <Text>{order.payment_method_title}</Text>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            )}
        </Modal>
    );
};
