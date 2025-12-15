import { useState, memo, useMemo, useCallback } from 'react';
import { Table, Button as AntButton, Space, Tag, message } from 'antd';
import { DeleteOutlined as Trash2, EditOutlined as Edit, CopyOutlined as Copy, CheckCircleOutlined as CheckCircle } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import CouponsTableSkeleton from './CouponsTableSkeleton';
import { getDiscountText, formatExpiryDate, getStatusConfig } from './utils/couponHelpers';
import { sanitizeCouponCode, validateCoupon } from './utils/securityHelpers';
import { secureLog } from '../../utils/logger';

/**
 * CouponsTable Component
 * 
 * Displays coupons in a table format.
 * PERFORMANCE: Optimized with lazy loading and skeleton states
 * SECURITY: Sanitizes all user-facing data to prevent XSS
 * 
 * @param {Array} coupons - Array of coupon objects
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Boolean} isLoading - Whether data is loading
 */
const CouponsTable = memo(({ coupons, onEdit, onDelete, formatCurrency, isRTL, t, isLoading = false }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = useCallback(async (code) => {
    if (!code || typeof code !== 'string') {
      secureLog.warn('Invalid coupon code for copying:', code);
      return;
    }
    
    const codeToCopy = code.trim();
    if (!codeToCopy) return;
    
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopiedCode(codeToCopy);
      message.success(t('codeCopied') || 'Code copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      secureLog.warn('Failed to copy coupon code:', err);
      message.error(t('copyFailed') || 'Failed to copy code');
    }
  }, [t]);

  // Filter valid coupons
  const validCoupons = useMemo(() => {
    return coupons ? coupons.filter(coupon => validateCoupon(coupon)) : [];
  }, [coupons]);

  // Define columns
  const columns = useMemo(() => [
    {
      title: t('code') || 'Code',
      key: 'code',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => {
        const sanitizedCode = sanitizeCouponCode(coupon.code);
        const originalCode = coupon.code ? coupon.code.trim() : '';
        return (
          <Space size={8}>
            <code style={{ fontSize: 14, fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
              {sanitizedCode}
            </code>
            <AntButton
              type="text"
              size="small"
              icon={copiedCode === originalCode ? <CheckCircle style={{ color: '#52c41a' }} /> : <Copy />}
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode(coupon.code);
              }}
              title={t('copyCode') || 'Copy code'}
            />
          </Space>
        );
      }
    },
    {
      title: t('discount') || 'Discount',
      key: 'discount',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => getDiscountText(coupon, formatCurrency)
    },
    {
      title: t('usageLimit') || 'Usage Limit',
      key: 'usageLimit',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => coupon.usage_limit ? coupon.usage_limit : t('unlimited') || 'Unlimited'
    },
    {
      title: t('used') || 'Used',
      key: 'used',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => coupon.usage_count || 0
    },
    {
      title: t('expiryDate') || 'Expiry Date',
      key: 'expiryDate',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => formatExpiryDate(coupon.date_expires, t)
    },
    {
      title: t('status') || 'Status',
      key: 'status',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => {
        const statusConfig = getStatusConfig(coupon.status);
        return (
          <Tag color={statusConfig.isActive ? 'success' : 'default'}>
            {t(statusConfig.label) || (statusConfig.isActive ? 'Active' : 'Inactive')}
          </Tag>
        );
      }
    },
    {
      title: t('actions') || 'Actions',
      key: 'actions',
      align: isRTL ? 'right' : 'left',
      render: (_, coupon) => (
        <Space size={8} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <AntButton
            type="text"
            icon={<Edit />}
            onClick={() => onEdit(coupon)}
            style={{ color: '#1890ff' }}
            title={t('editCoupon') || 'Edit coupon'}
          />
          <AntButton
            type="text"
            icon={<Trash2 />}
            onClick={() => onDelete(coupon.id)}
            danger
            title={t('deleteCoupon') || 'Delete coupon'}
          />
        </Space>
      )
    }
  ], [isRTL, t, formatCurrency, onEdit, onDelete, copiedCode, handleCopyCode]);

  // Show skeleton while loading
  if (isLoading && validCoupons.length === 0) {
    return <CouponsTableSkeleton count={10} />;
  }

  if (validCoupons.length === 0) {
    return null;
  }

  return (
    <Table
      columns={columns}
      dataSource={validCoupons}
      rowKey="id"
      pagination={false}
      loading={isLoading}
      scroll={{ x: true }}
    />
  );
});

CouponsTable.displayName = 'CouponsTable';

export default CouponsTable;

