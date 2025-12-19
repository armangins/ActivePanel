import { Card, Row, Col, Typography } from 'antd';
import {
    ClockCircleOutlined,
    SyncOutlined,
    PauseCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text, Title } = Typography;

interface OrderStatusCardsProps {
    statusCounts: Record<string, number>;
    onStatusClick: (status: string) => void;
    selectedStatus: string;
}

// Generate deterministic mock data for the sparklines
const generateData = (key: string) => {
    const seed = key.length;
    return Array.from({ length: 15 }, (_, i) => ({
        value: Math.abs(Math.sin((i + seed) * 0.5) * 50 + 50 + (Math.random() * 20))
    }));
};

export const OrderStatusCards = ({ statusCounts, onStatusClick, selectedStatus }: OrderStatusCardsProps) => {
    const { t } = useLanguage();

    const statuses = [
        { key: 'all', label: t('allOrders') || 'All Orders', icon: <InboxOutlined />, color: '#3b82f6', bgColor: '#eff6ff' }, // Blue
        { key: 'pending', label: t('pending') || 'Pending', icon: <ClockCircleOutlined />, color: '#f59e0b', bgColor: '#fffbeb' }, // Orange
        { key: 'processing', label: t('processing') || 'Processing', icon: <SyncOutlined spin />, color: '#0ea5e9', bgColor: '#f0f9ff' }, // Light Blue
        { key: 'on-hold', label: t('onHold') || 'On Hold', icon: <PauseCircleOutlined />, color: '#8b5cf6', bgColor: '#f5f3ff' }, // Purple
        { key: 'completed', label: t('completed') || 'Completed', icon: <CheckCircleOutlined />, color: '#10b981', bgColor: '#ecfdf5' }, // Green
        { key: 'cancelled', label: t('cancelled') || 'Cancelled', icon: <CloseCircleOutlined />, color: '#ef4444', bgColor: '#fef2f2' } // Red
    ];

    return (
        <Row gutter={[16, 16]}>
            {statuses.map((status) => {
                const isSelected = selectedStatus === status.key;
                const count = statusCounts[status.key] || 0;
                const chartData = generateData(status.key);

                return (
                    <Col xs={24} sm={12} lg={6} xl={4} key={status.key} style={{ flex: '1 0 auto' }}>
                        <Card
                            hoverable
                            onClick={() => onStatusClick(status.key)}
                            style={{
                                cursor: 'pointer',
                                border: isSelected ? `1px solid ${status.color}` : '1px solid #f0f0f0',
                                backgroundColor: '#fff',
                                borderRadius: 16, // More rounded as per image
                                overflow: 'hidden',
                                position: 'relative',
                                height: '100%',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                            }}
                            bodyStyle={{ padding: '24px 24px 0 24px', height: 160 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, zIndex: 1, position: 'relative' }}>
                                {/* Hexagon Icon container */}
                                <div style={{
                                    backgroundColor: status.bgColor, // Using the light bg for the shape usually, or transparent if using the specific image style
                                    // The image actually has a FILLED colored hexagon. Let's do that.
                                    // Actually the image has a Solid Color Hexagon with White Icon.
                                    background: status.color,
                                    color: '#fff',
                                    width: 48,
                                    height: 48,
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', // Hexagon ish
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22,
                                    flexShrink: 0
                                }}>
                                    {status.icon}
                                </div>

                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: 2 }}>
                                        {status.label}
                                    </Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 800, fontSize: 28, lineHeight: 1.2 }}>
                                        {count.toLocaleString()}
                                    </Title>
                                </div>
                            </div>

                            {/* Decorative Chart at Bottom */}
                            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, height: 60, opacity: 0.6 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id={`color-${status.key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={status.color} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={status.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={status.color}
                                            strokeWidth={3}
                                            fill={`url(#color-${status.key})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};
