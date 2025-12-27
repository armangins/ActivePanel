import { Modal, Descriptions, Tabs, Table, Tag, Typography, Spin } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomerDetails, useCustomerOrders } from '../hooks/useCustomersData';

const { Text } = Typography;

interface CustomerDetailsModalProps {
    customerId: number | null;
    onClose: () => void;
}

export const CustomerDetailsModal = ({ customerId, onClose }: CustomerDetailsModalProps) => {
    const { t } = useLanguage();
    const { data: customer, isLoading } = useCustomerDetails(customerId);

    // Fetch orders separately if needed. For now assuming basic recent orders are enough or fetching them here.
    const { data: orders, isLoading: isLoadingOrders } = useCustomerOrders(customerId);

    if (!customerId) return null;

    const renderBilling = () => (
        <Descriptions title={t('billingAddress') || 'Billing Address'} column={1}>
            <Descriptions.Item label={t('address') || 'Address'}>
                {customer?.billing?.address_1} {customer?.billing?.address_2}
            </Descriptions.Item>
            <Descriptions.Item label={t('city') || 'City'}>
                {customer?.billing?.city}, {customer?.billing?.state} {customer?.billing?.postcode}
            </Descriptions.Item>
            <Descriptions.Item label={t('country') || 'Country'}>
                {customer?.billing?.country}
            </Descriptions.Item>
            <Descriptions.Item label={t('phone') || 'Phone'}>
                {customer?.billing?.phone}
            </Descriptions.Item>
            <Descriptions.Item label={t('email') || 'Email'}>
                {customer?.billing?.email}
            </Descriptions.Item>
        </Descriptions>
    );

    const renderShipping = () => (
        <Descriptions title={t('shippingAddress') || 'Shipping Address'} column={1}>
            <Descriptions.Item label={t('address') || 'Address'}>
                {customer?.shipping?.address_1} {customer?.shipping?.address_2}
            </Descriptions.Item>
            <Descriptions.Item label={t('city') || 'City'}>
                {customer?.shipping?.city}, {customer?.shipping?.state} {customer?.shipping?.postcode}
            </Descriptions.Item>
            <Descriptions.Item label={t('country') || 'Country'}>
                {customer?.shipping?.country}
            </Descriptions.Item>
        </Descriptions>
    );

    const renderOrders = () => {
        const columns = [
            { title: t('order') || 'Order', dataIndex: 'id', render: (id: any) => `#${id}` },
            { title: t('date') || 'Date', dataIndex: 'date_created', render: (date: string) => new Date(date).toLocaleDateString() },
            { title: t('status') || 'Status', dataIndex: 'status', render: (status: string) => <Tag color={status === 'completed' ? 'green' : 'blue'}>{status}</Tag> },
            { title: t('total') || 'Total', dataIndex: 'total', render: (val: string) => `$${parseFloat(val).toFixed(2)}` }
        ];

        return (
            <Table
                dataSource={orders || []}
                columns={columns}
                rowKey="id"
                loading={isLoadingOrders}
                pagination={false}
                scroll={{ y: 300 }}
            />
        );
    };

    const items = [
        {
            key: 'details', label: t('details') || 'Details', children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {renderBilling()}
                    {renderShipping()}
                </div>
            )
        },
        { key: 'orders', label: t('orders') || 'Orders', children: renderOrders() }
    ];

    const fullName = customer ? `${customer.first_name} ${customer.last_name}`.trim() || customer.username : '';

    return (
        <Modal
            open={!!customerId}
            onCancel={onClose}
            title={isLoading ? t('loading') : fullName}
            width={800}
            footer={null}
        >
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: 24, marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{t('ordersCount') || 'Orders'}</Text>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                {customer?.orders_count || 0}
                            </div>
                        </div>
                        <div style={{ width: 1, background: '#f0f0f0' }} />
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{t('totalSpent') || 'Total Spent'}</Text>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                {customer?.total_spent ? `$${parseFloat(customer.total_spent).toFixed(2)}` : '$0.00'}
                            </div>
                        </div>
                    </div>
                    <Tabs items={items} />
                </>
            )}
        </Modal>
    );
};
