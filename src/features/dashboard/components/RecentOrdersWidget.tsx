import { Table, Card, Tag, Typography } from 'antd';
import { DashboardOrder } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const { Title } = Typography;

interface RecentOrdersWidgetProps {
    orders: DashboardOrder[];
}

export const RecentOrdersWidget = ({ orders }: RecentOrdersWidgetProps) => {
    const { t } = useLanguage();

    const columns = [
        {
            title: t('order') || 'Order',
            dataIndex: 'id',
            key: 'id',
            render: (id: number) => `#${id}`,
        },
        {
            title: t('date') || 'Date',
            dataIndex: 'date_created',
            key: 'date_created',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: t('status') || 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'completed') color = 'green';
                if (status === 'processing') color = 'blue';
                if (status === 'pending') color = 'orange';
                if (status === 'cancelled') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: t('total') || 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total: string) => `$${parseFloat(total).toFixed(2)}`,
        }
    ];

    return (
        <Card title={t('recentOrders') || 'Recent Orders'}>
            <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
            />
        </Card>
    );
};
