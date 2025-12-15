import { memo, useMemo } from 'react';
import { Table, Tag, Button as AntButton, Space } from 'antd';
import { InboxOutlined as Package, SearchOutlined as Search } from '@ant-design/icons';
import { OptimizedImage } from '../ui';

/**
 * OrdersTable Component
 * 
 * Table displaying orders with columns matching the design:
 * Product, Order ID, Price, Quantity, Payment, Status, Tracking
 * 
 * @param {Array} orders - Array of order objects
 * @param {Function} onViewDetails - Callback when viewing order details
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrdersTable = memo(({ orders, onViewDetails, onStatusUpdate, formatCurrency, isRTL, t }) => {
  // Get status config
  const getStatusConfig = (status) => {
    const configs = {
      completed: { color: 'success', label: t('success') || 'Success' || 'הצלחה' },
      pending: { color: 'default', label: t('pending') || 'Pending' || 'ממתין' },
      processing: { color: 'processing', label: t('processing') || 'Processing' || 'מעבד' },
      cancelled: { color: 'error', label: t('cancel') || 'Cancel' || 'בוטל' },
      'on-hold': { color: 'warning', label: t('onHold') || 'On Hold' || 'מושהה' },
      refunded: { color: 'error', label: t('refunded') || 'Refunded' || 'הוחזר' }
    };
    return configs[status] || { color: 'default', label: status };
  };

  // Define columns
  const columns = useMemo(() => [
    {
      title: t('product') || 'מוצר',
      key: 'product',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => {
        const firstItem = order.line_items?.[0];
        const productImage = firstItem?.image?.src || null;
        const productName = firstItem?.name || t('product') || 'מוצר';
        const customerName = order.billing?.first_name && order.billing?.last_name
          ? `${order.billing.first_name} ${order.billing.last_name}`
          : order.billing?.first_name || order.billing?.last_name || order.billing?.email || t('customer') || 'לקוח';

        return (
          <Space size={12} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {productImage ? (
                <OptimizedImage src={productImage} alt={productName} width={48} height={48} />
              ) : (
                <Package style={{ fontSize: 20, color: '#bfbfbf' }} />
              )}
            </div>
            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', marginBottom: 4 }}>{customerName}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{productName}</div>
            </div>
          </Space>
        );
      }
    },
    {
      title: t('orderId') || 'מספר הזמנה',
      key: 'orderId',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => order.number || `#${order.id}`
    },
    {
      title: t('price') || 'מחיר',
      key: 'price',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => (
        <span style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
          {formatCurrency(parseFloat(order.total || 0))}
        </span>
      )
    },
    {
      title: t('quantity') || 'כמות',
      key: 'quantity',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => {
        const totalQuantity = order.line_items?.reduce((sum, item) => sum + (parseInt(item.quantity || 0, 10)), 0) || 0;
        return totalQuantity.toLocaleString();
      }
    },
    {
      title: t('payment') || 'תשלום',
      key: 'payment',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => {
        const paymentMethod = order.payment_method_title || order.payment_method || t('payment') || 'תשלום';
        const paymentStatus = order.payment_status || 'pending';
        return (
          <Tag color={paymentStatus === 'paid' || paymentStatus === 'completed' ? 'blue' : 'default'}>
            {paymentMethod}
          </Tag>
        );
      }
    },
    {
      title: t('status') || 'סטטוס',
      key: 'status',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => {
        const statusConfig = getStatusConfig(order.status);
        return <Tag color={statusConfig.color}>{statusConfig.label}</Tag>;
      }
    },
    {
      title: t('tracking') || 'מעקב',
      key: 'tracking',
      align: isRTL ? 'right' : 'left',
      render: (_, order) => (
        <AntButton
          type="primary"
          icon={<Search />}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order);
          }}
        >
          {t('viewDetails') || 'צפה בפרטים'}
        </AntButton>
      )
    }
  ], [isRTL, t, formatCurrency, onViewDetails]);

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onViewDetails(record),
        style: { cursor: 'pointer' }
      })}
      pagination={false}
      scroll={{ x: true }}
    />
  );
});

OrdersTable.displayName = 'OrdersTable';

export default OrdersTable;
