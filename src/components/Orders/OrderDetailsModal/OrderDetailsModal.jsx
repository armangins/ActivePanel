import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Modal, Spin, Card, Row, Col, Space, Typography, Descriptions } from 'antd';
import { InboxOutlined as Package } from '@ant-design/icons';
import { ordersAPI } from '../../../services/woocommerce';
import { useOrder } from '../../../hooks/useOrders';
import { OptimizedImage } from '../../ui';

const { Title, Text } = Typography;

/**
 * OrderDetailsModal Component
 * 
 * Main modal component for displaying order details in a two-column layout:
 * Left: Order items and cart totals
 * Right: Summary, shipping address, payment method, expected delivery
 * 
 * @param {Object} order - Order object to display (may be partial from list)
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsModal = ({ order, onClose, onStatusUpdate, formatCurrency, isRTL, t }) => {
  const [fullOrder, setFullOrder] = useState(order);
  // Use useOrder hook for data fetching with caching
  const { data: fullOrderData, isLoading: loading } = useOrder(order?.id);

  useEffect(() => {
    if (fullOrderData) {
      setFullOrder(fullOrderData);
    }
  }, [fullOrderData]);

  if (!order) return null;

  // Use fullOrder if available, otherwise fall back to order prop
  const displayOrder = fullOrder || order;

  // Get product image from line item
  const getProductImage = (item) => {
    if (item.image?.src) {
      return item.image.src;
    }
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  // Calculate totals
  const subtotal = displayOrder.line_items?.reduce((sum, item) => sum + parseFloat(item.total || 0), 0) || 0;
  const shippingTotal = parseFloat(displayOrder.shipping_total || 0);
  const taxTotal = parseFloat(displayOrder.total_tax || 0);
  const total = parseFloat(displayOrder.total || 0);

  // Get shipping address
  const shippingAddress = displayOrder.shipping
    ? `${displayOrder.shipping.address_1 || ''} ${displayOrder.shipping.address_2 || ''} ${displayOrder.shipping.city || ''}, ${displayOrder.shipping.state || ''} ${displayOrder.shipping.postcode || ''} ${displayOrder.shipping.country || ''} `.trim()
    : displayOrder.billing
      ? `${displayOrder.billing.address_1 || ''} ${displayOrder.billing.address_2 || ''} ${displayOrder.billing.city || ''}, ${displayOrder.billing.state || ''} ${displayOrder.billing.postcode || ''} ${displayOrder.billing.country || ''} `.trim()
      : t('noAddress') || 'לא צוין כתובת';

  // Get payment method
  const paymentMethod = displayOrder.payment_method_title || displayOrder.payment_method || t('paymentMethod') || 'שיטת תשלום';

  // Expected delivery date (using order date + 1 day as example, or use meta_data if available)
  const expectedDeliveryDate = displayOrder.meta_data?.find(meta => meta.key === '_expected_delivery_date')?.value
    || displayOrder.date_created
    || '';

  return (
    <Modal
      open={!!order}
      onCancel={onClose}
      title={
        <div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            {t('dashboard') || 'לוח בקרה'} &gt; {t('orders') || 'הזמנות'} &gt; {t('orderDetails') || 'פרטי הזמנה'}
          </Text>
          <Title level={4} style={{ margin: 0 }}>{t('orderDetails') || 'פרטי הזמנה'}</Title>
        </div>
      }
      footer={null}
      width={1200}
      style={{ top: 20 }}
      styles={{ body: { padding: 24, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      <Spin spinning={loading} tip={t('loading') || 'טוען...'}>
        {!loading && (
          <Row gutter={[24, 24]}>
            {/* Left Column - Order Items and Cart Totals (2/3 width) */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* All Items Section */}
                <Card title={t('allItems') || 'כל הפריטים'}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {displayOrder.line_items?.map((item, index) => {
                      const imageUrl = getProductImage(item);
                      return (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 16, 
                          padding: 16, 
                          backgroundColor: '#fafafa', 
                          borderRadius: 8 
                        }}>
                          <div style={{ 
                            width: 64, 
                            height: 64, 
                            borderRadius: 8, 
                            overflow: 'hidden', 
                            backgroundColor: '#f0f0f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {imageUrl ? (
                              <OptimizedImage src={imageUrl} alt={item.name || 'Product'} width={64} height={64} />
                            ) : (
                              <Package style={{ fontSize: 24, color: '#bfbfbf' }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{ display: 'block', marginBottom: 4 }}>
                              {item.name || t('product') || 'מוצר'}
                            </Text>
                            {item.sku && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {t('sku')}: {item.sku}
                              </Text>
                            )}
                          </div>
                          <div style={{ minWidth: 60, textAlign: 'center' }}>
                            <Text>{item.quantity}</Text>
                          </div>
                          <div style={{ minWidth: 80, textAlign: isRTL ? 'right' : 'left' }}>
                            <Text strong>{formatCurrency(parseFloat(item.price || 0))}</Text>
                          </div>
                        </div>
                      );
                    })}
                  </Space>
                </Card>

                {/* Cart Totals Section */}
                <Card 
                  title={t('cartTotals') || 'סיכום עגלה'}
                  extra={<Text type="secondary">{t('price') || 'מחיר'}</Text>}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text>{t('subtotal') || 'סה"כ ביניים'}:</Text>
                      <Text strong>{formatCurrency(subtotal)}</Text>
                    </div>
                    {shippingTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <Text>{t('shipping') || 'משלוח'}:</Text>
                        <Text strong>{formatCurrency(shippingTotal)}</Text>
                      </div>
                    )}
                    {taxTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <Text>{t('tax') || 'מס'} ({t('gst') || 'מע"מ'}):</Text>
                        <Text strong>{formatCurrency(taxTotal)}</Text>
                      </div>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      paddingTop: 12, 
                      borderTop: '1px solid #f0f0f0' 
                    }}>
                      <Text strong style={{ fontSize: 16 }}>{t('totalPrice') || 'סה"כ'}:</Text>
                      <Text strong style={{ fontSize: 18, color: '#ff7a45' }}>{formatCurrency(total)}</Text>
                    </div>
                  </Space>
                </Card>
              </Space>
            </Col>

            {/* Right Column - Summary Cards (1/3 width) */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* Summary Card */}
                <Card title={t('summary') || 'סיכום'}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('orderId') || 'מספר הזמנה'}>
                      #{displayOrder.number || displayOrder.id}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('date') || 'תאריך'}>
                      {formatDate(displayOrder.date_created)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('total') || 'סה"כ'}>
                      <Text strong style={{ fontSize: 18, color: '#ff7a45' }}>
                        {formatCurrency(total)}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Shipping Address Card */}
                <Card title={t('shippingAddress') || 'כתובת משלוח'}>
                  <Text>{shippingAddress}</Text>
                </Card>

                {/* Payment Method Card */}
                <Card title={t('paymentMethod') || 'שיטת תשלום'}>
                  <Text>{paymentMethod}</Text>
                </Card>
              </Space>
            </Col>
          </Row>
        )}
      </Spin>
    </Modal>
  );
};

export default OrderDetailsModal;
