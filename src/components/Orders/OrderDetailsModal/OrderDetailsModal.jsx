import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { ordersAPI } from '../../../services/woocommerce';
import { useOrder } from '../../../hooks/useOrders';
import { CubeIcon } from '@heroicons/react/24/outline';

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
    ? `${displayOrder.shipping.address_1 || ''} ${displayOrder.shipping.address_2 || ''} ${displayOrder.shipping.city || ''}, ${displayOrder.shipping.state || ''} ${displayOrder.shipping.postcode || ''} ${displayOrder.shipping.country || ''}`.trim()
    : displayOrder.billing
      ? `${displayOrder.billing.address_1 || ''} ${displayOrder.billing.address_2 || ''} ${displayOrder.billing.city || ''}, ${displayOrder.billing.state || ''} ${displayOrder.billing.postcode || ''} ${displayOrder.billing.country || ''}`.trim()
      : t('noAddress') || 'לא צוין כתובת';

  // Get payment method
  const paymentMethod = displayOrder.payment_method_title || displayOrder.payment_method || t('paymentMethod') || 'שיטת תשלום';

  // Expected delivery date (using order date + 1 day as example, or use meta_data if available)
  const expectedDeliveryDate = displayOrder.meta_data?.find(meta => meta.key === '_expected_delivery_date')?.value
    || displayOrder.date_created
    || '';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 sm:rounded-lg max-w-6xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              {t('dashboard') || 'לוח בקרה'} &gt; {t('orders') || 'הזמנות'} &gt; {t('orderDetails') || 'פרטי הזמנה'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('orderDetails') || 'פרטי הזמנה'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('close') || 'סגור'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        {loading ? (
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">{t('loading') || 'טוען...'}</div>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items and Cart Totals (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* All Items Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('allItems') || 'כל הפריטים'}
                  </h3>
                </div>

                {/* Product List */}
                <div className="space-y-4">
                  {displayOrder.line_items?.map((item, index) => {
                    const imageUrl = getProductImage(item);
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name || t('product') || 'מוצר'}
                          </p>
                          {item.sku && (
                            <p className="text-xs text-gray-500 mt-1">
                              {t('sku')}: {item.sku}
                            </p>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="text-sm text-gray-700 min-w-[60px] text-center">
                          {item.quantity}
                        </div>

                        {/* Price */}
                        <div className="text-sm font-medium text-gray-900 min-w-[80px] text-left">
                          {formatCurrency(parseFloat(item.price || 0))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cart Totals Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('cartTotals') || 'סיכום עגלה'}
                  </h3>
                  <span className="text-sm text-gray-500">{t('price') || 'מחיר'}</span>
                </div>

                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{t('subtotal') || 'סה"כ ביניים'}:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Shipping */}
                  {shippingTotal > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{t('shipping') || 'משלוח'}:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(shippingTotal)}</span>
                    </div>
                  )}

                  {/* Tax */}
                  {taxTotal > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{t('tax') || 'מס'} ({t('gst') || 'מע"מ'}):</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(taxTotal)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-base font-semibold text-gray-900">{t('totalPrice') || 'סה"כ'}:</span>
                    <span className="text-lg font-bold text-orange-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary Cards (1/3 width) */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('summary') || 'סיכום'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">{t('orderId') || 'מספר הזמנה'}:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      #{displayOrder.number || displayOrder.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">{t('date') || 'תאריך'}:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(displayOrder.date_created)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">{t('total') || 'סה"כ'}:</span>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('shippingAddress') || 'כתובת משלוח'}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {shippingAddress}
                </p>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('paymentMethod') || 'שיטת תשלום'}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {paymentMethod}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
