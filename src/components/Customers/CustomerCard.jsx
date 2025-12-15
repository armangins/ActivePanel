import { memo, useCallback } from 'react';
import { MailOutlined as Mail, PhoneOutlined as Phone, EnvironmentOutlined as MapPin, UserOutlined as User, ShoppingOutlined as ShoppingBag, TruckOutlined as Truck } from '@ant-design/icons';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders, orderKeys } from '../../hooks/useOrders';
import { customersAPI, ordersAPI } from '../../services/woocommerce';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

/**
 * CustomerCard Component
 * 
 * Individual customer card displaying customer information.
 * 
 * @param {Object} customer - Customer object
 * @param {Function} onClick - Callback when card is clicked
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Function} formatCurrency - Function to format currency
 */
const CustomerCard = ({ customer, onClick, formatCurrency, t }) => {
  const queryClient = useQueryClient();
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: '100px', // Start loading when within 100px of viewport
    triggerOnce: true, // Only trigger once
  });

  // Fetch last 3 orders for the card (only when visible)
  const { data: ordersData, isLoading: isLoadingOrders } = useOrders({
    customer: customer.id,
    per_page: 3,
    fields: ['id', 'status', 'total', 'date_created', 'currency', 'shipping_lines'],
    enabled: isVisible, // Only fetch when visible
  });

  const lastOrder = ordersData?.data?.[0];

  // Prefetch detailed data on hover
  const handleMouseEnter = () => {
    // Prefetch customer details
    queryClient.prefetchQuery({
      queryKey: ['customers', 'detail', customer.id],
      queryFn: () => customersAPI.getById(customer.id),
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch full order history
    queryClient.prefetchQuery({
      queryKey: orderKeys.list({ customer: customer.id, per_page: 10 }),
      queryFn: () => ordersAPI.list({
        customer: customer.id,
        per_page: 10,
        fields: ['id', 'status', 'total', 'date_created', 'currency', 'line_items', 'shipping_lines'],
      }),
      staleTime: 5 * 60 * 1000,
    });
  };
  const shippingMethod = lastOrder?.shipping_lines?.[0]?.method_title;

  const getStatusStyle = (status) => {
    if (status === 'completed') {
      return { backgroundColor: '#dcfce7', color: '#166534' };
    } else if (status === 'processing') {
      return { backgroundColor: '#dbeafe', color: '#1e40af' };
    } else {
      return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          backgroundColor: '#e0e7ff', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0 
        }}>
          <User style={{ width: '24px', height: '24px', color: '#4560FF' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#111827', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {customer.first_name} {customer.last_name}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {customer.username}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {customer.email && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#4b5563' }}>
            <Mail style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email}</span>
          </div>
        )}
        {customer.billing?.phone && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#4b5563' }}>
            <Phone style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af', flexShrink: 0 }} />
            <span>{customer.billing.phone}</span>
          </div>
        )}
        {customer.billing?.city && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#4b5563' }}>
            <MapPin style={{ width: '16px', height: '16px', marginRight: '8px', color: '#9ca3af', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customer.billing.city}, {customer.billing.country}
            </span>
          </div>
        )}
      </div>

      {/* Order History Summary */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
          Recent Orders
        </h4>
        {isLoadingOrders ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: '32px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
            ))}
          </div>
        ) : ordersData?.data?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ordersData.data.map(order => {
              const statusStyle = getStatusStyle(order.status);
              return (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                    <span style={{ color: '#4b5563' }}>#{order.id}</span>
                    <span style={{ color: '#9ca3af' }}>•</span>
                    <span style={{ color: '#6b7280' }}>{format(new Date(order.date_created), 'MMM d, yyyy')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '9999px', 
                      fontSize: '10px', 
                      fontWeight: 500,
                      ...statusStyle
                    }}>
                      {order.status}
                    </span>
                    <span style={{ fontWeight: 500, color: '#111827' }}>
                      {formatCurrency ? formatCurrency(order.total) : order.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
            {t('noOrders') || 'No orders found'}
          </p>
        )}
      </div>

      {/* Shipping Method */}
      {shippingMethod && (
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px', 
          borderTop: '1px solid #e5e7eb', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '12px', 
          color: '#4b5563',
          flexDirection: 'row-reverse'
        }}>
          <Truck style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
          <span style={{ fontWeight: 500 }}>{t('shippingMethod') || 'Shipping'}:</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shippingMethod}</span>
        </div>
      )}

      {customer.date_created && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            {format(new Date(customer.date_created), 'MMM yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(CustomerCard);


