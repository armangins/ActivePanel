import { useMemo, useCallback, useState } from 'react';
import { Table, Button as AntButton, Space, message } from 'antd';
import { DeleteOutlined as Trash2, EditOutlined as Edit, CopyOutlined as Copy, CheckCircleOutlined as CheckCircle } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Coupon } from '../../types';
import { secureLog } from '@/utils/logger';
import dayjs from 'dayjs';

interface CouponsTableProps {
    coupons: Coupon[];
    isLoading: boolean;
    onEdit: (coupon: Coupon) => void;
    onDelete: (id: number) => void;
    pagination?: any;
}

const CouponsTable = ({ coupons, isLoading, onEdit, onDelete, pagination }: CouponsTableProps) => {
    const { t, formatCurrency, isRTL } = useLanguage();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = useCallback(async (code: string) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            message.success(t('codeCopied') || 'Code copied!');
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            secureLog.warn('Failed to copy coupon code:', err);
            message.error(t('copyFailed') || 'Failed to copy code');
        }
    }, [t]);

    const columns = useMemo(() => [
        {
            title: t('code') || 'Code',
            key: 'code',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, coupon: Coupon) => (
                <Space size={8}>
                    <code style={{ fontSize: 14, fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
                        {coupon.code}
                    </code>
                    <AntButton
                        type="text"
                        size="small"
                        icon={copiedCode === coupon.code ? <CheckCircle style={{ color: '#52c41a' }} /> : <Copy />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(coupon.code);
                        }}
                    />
                </Space>
            )
        },
        {
            title: t('discount') || 'Discount',
            key: 'discount',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, coupon: Coupon) => {
                const amount = parseFloat(coupon.amount);
                if (coupon.discount_type === 'percent') {
                    return `${amount}%`;
                }
                return formatCurrency(amount);
            }
        },
        {
            title: t('usageLimit') || 'Usage Limit',
            key: 'usageLimit',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, coupon: Coupon) => coupon.usage_limit || (t('unlimited') || 'Unlimited')
        },
        {
            title: t('used') || 'Used',
            key: 'used',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, coupon: Coupon) => coupon.usage_count || 0
        },
        {
            title: t('expiryDate') || 'Expiry Date',
            key: 'expiryDate',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, coupon: Coupon) => coupon.date_expires ? dayjs(coupon.date_expires).format('YYYY-MM-DD') : (t('neverExpires') || 'Never expires')
        },
        {
            title: t('actions') || 'Actions',
            key: 'actions',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, coupon: Coupon) => (
                <Space size={8} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    <AntButton
                        type="text"
                        icon={<Edit />}
                        onClick={() => onEdit(coupon)}
                        style={{ color: '#1890ff' }}
                    />
                    <AntButton
                        type="text"
                        icon={<Trash2 />}
                        onClick={() => onDelete(coupon.id)}
                        danger
                    />
                </Space>
            )
        }
    ], [isRTL, t, formatCurrency, copiedCode, handleCopyCode, onEdit, onDelete]);

    return (
        <Table
            columns={columns}
            dataSource={coupons}
            rowKey="id"
            pagination={pagination}
            loading={isLoading}
            scroll={{ x: 800 }}
        />
    );
};

export default CouponsTable;
