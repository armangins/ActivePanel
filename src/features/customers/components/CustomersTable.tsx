import { Table, Tag, Button, theme } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Customer } from '../types';
import type { ColumnsType } from 'antd/es/table';

interface CustomersTableProps {
    customers: Customer[];
    loading: boolean;
    onViewDetails: (customer: Customer) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
    customers,
    loading,
    onViewDetails
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();

    const columns: ColumnsType<Customer> = [
        {
            title: t('customer'),
            dataIndex: 'first_name',
            key: 'name',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.first_name} {record.last_name}
                    </div>
                    <div style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
                        @{record.username}
                    </div>
                </div>
            ),
        },
        {
            title: t('email'),
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: t('totalOrders'),
            dataIndex: 'orders_count',
            key: 'orders_count',
            align: 'center' as const,
            render: (count: number) => (
                <Tag color="blue">{count || 0}</Tag>
            ),
        },
        {
            title: t('memberSince'),
            dataIndex: 'date_created',
            key: 'date_created',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: t('actions'),
            key: 'actions',
            align: 'center' as const,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetails(record)}
                >
                    {t('viewDetails')}
                </Button>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={customers}
            loading={loading}
            rowKey="id"
            pagination={false}
        />
    );
};
