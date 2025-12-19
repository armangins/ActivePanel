import { Card, Row, Col, Statistic } from 'antd';
import {
    ClockCircleOutlined,
    SyncOutlined,
    PauseCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    RollbackOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderStatusCardsProps {
    statusCounts: Record<string, number>;
    onStatusClick: (status: string) => void;
    selectedStatus: string;
}

export const OrderStatusCards = ({ statusCounts, onStatusClick, selectedStatus }: OrderStatusCardsProps) => {
    const { t } = useLanguage();

    const statuses = [
        { key: 'all', label: t('allOrders') || 'All Orders', icon: <InboxOutlined />, color: '#1890ff' },
        { key: 'pending', label: t('pending') || 'Pending', icon: <ClockCircleOutlined />, color: '#faad14' },
        { key: 'processing', label: t('processing') || 'Processing', icon: <SyncOutlined spin />, color: '#1890ff' },
        { key: 'on-hold', label: t('onHold') || 'On Hold', icon: <PauseCircleOutlined />, color: '#faad14' },
        { key: 'completed', label: t('completed') || 'Completed', icon: <CheckCircleOutlined />, color: '#52c41a' },
        { key: 'cancelled', label: t('cancelled') || 'Cancelled', icon: <CloseCircleOutlined />, color: '#ff4d4f' },
        { key: 'refunded', label: t('refunded') || 'Refunded', icon: <RollbackOutlined />, color: '#ff4d4f' }
    ];

    return (
        <Row gutter={[16, 16]}>
            {statuses.map((status) => (
                <Col xs={12} sm={8} lg={3} key={status.key} style={{ flex: '1 0 auto' }}>
                    <Card
                        hoverable
                        onClick={() => onStatusClick(status.key)}
                        style={{
                            cursor: 'pointer',
                            borderColor: selectedStatus === status.key ? status.color : undefined,
                            backgroundColor: selectedStatus === status.key ? '#f0f5ff' : undefined
                        }}
                        bodyStyle={{ padding: 16, textAlign: 'center' }}
                    >
                        <div style={{ fontSize: 24, color: status.color, marginBottom: 8 }}>
                            {status.icon}
                        </div>
                        <Statistic
                            value={statusCounts[status.key] || 0}
                            valueStyle={{ fontSize: 20, fontWeight: 600 }}
                        />
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                            {status.label}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};
