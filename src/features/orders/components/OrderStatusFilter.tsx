import React, { useState, useEffect } from 'react';
import { Popover, Button, Checkbox, Space, Badge, Divider, Typography, Grid } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

interface OrderStatusFilterProps {
    selectedStatuses: string[];
    onStatusChange: (statuses: string[]) => void;
}

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', labelHe: 'ממתין', color: '#faad14' },
    { value: 'processing', label: 'Processing', labelHe: 'בטיפול', color: '#1890ff' },
    { value: 'completed', label: 'Completed', labelHe: 'הושלם', color: '#52c41a' },
    { value: 'cancelled', label: 'Cancelled', labelHe: 'בוטל', color: '#ff4d4f' },
    { value: 'on-hold', label: 'On Hold', labelHe: 'בהמתנה', color: '#8c8c8c' },
    { value: 'refunded', label: 'Refunded', labelHe: 'הוחזר', color: '#722ed1' }
];

export const OrderStatusFilter: React.FC<OrderStatusFilterProps> = ({
    selectedStatuses,
    onStatusChange
}) => {
    const { t, language } = useLanguage();
    const [localSelected, setLocalSelected] = useState<string[]>(selectedStatuses);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setLocalSelected(selectedStatuses);
    }, [selectedStatuses]);

    const handleToggle = (status: string) => {
        const newSelected = localSelected.includes(status)
            ? localSelected.filter(s => s !== status)
            : [...localSelected, status];
        setLocalSelected(newSelected);
    };

    const handleSelectAll = () => {
        setLocalSelected(ORDER_STATUSES.map(s => s.value));
    };

    const handleClear = () => {
        setLocalSelected([]);
    };

    const handleApply = () => {
        onStatusChange(localSelected);
        setVisible(false);
    };

    const content = (
        <div style={{ width: 280 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {ORDER_STATUSES.map(status => (
                    <div
                        key={status.value}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 0',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleToggle(status.value)}
                    >
                        <Space>
                            <Checkbox
                                checked={localSelected.includes(status.value)}
                                onChange={() => handleToggle(status.value)}
                            />
                            <Text>{language === 'he' ? status.labelHe : status.label}</Text>
                        </Space>
                        <Badge color={status.color} />
                    </div>
                ))}
            </Space>

            <Divider style={{ margin: '12px 0' }} />

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size={8}>
                    <Button size="small" onClick={handleSelectAll}>
                        {t('selectAll')}
                    </Button>
                    <Button size="small" onClick={handleClear}>
                        {t('clear')}
                    </Button>
                </Space>
                <Button type="primary" size="small" onClick={handleApply}>
                    {t('apply')}
                </Button>
            </Space>
        </div>
    );

    const selectedCount = selectedStatuses.length;
    const totalCount = ORDER_STATUSES.length;

    const screens = Grid.useBreakpoint();

    return (
        <Popover
            content={content}
            title={t('filterStatuses')}
            trigger="click"
            open={visible}
            onOpenChange={setVisible}
            placement="bottomLeft"
        >
            <Button icon={<FilterOutlined />} style={{ minHeight: 32 }}>
                {screens.md && `${t('filterStatuses')} (${selectedCount}/${totalCount})`}
            </Button>
        </Popover>
    );
};
