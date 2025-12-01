import { memo, useCallback } from 'react';
import { EnvelopeIcon as Mail, PhoneIcon as Phone, MapPinIcon as MapPin, UserIcon as User, ShoppingBagIcon as ShoppingBag, TruckIcon as Truck } from '@heroicons/react/24/outline';
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

  return (
    <div
      ref={ref}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className={`flex items-start gap-4`}>
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold text-gray-900 truncate`}>
            {customer.first_name} {customer.last_name}
          </h3>
          <p className={`text-sm text-gray-500 truncate`}>
            {customer.username}
          </p>
        </div>
      </div>

      <div className={`mt-4 space-y-2`}>
        {customer.email && (
          <div className={`flex items-center text-sm text-gray-600`}>
            <Mail className={`w-4 h-4 mr-2 text-gray-400 flex-shrink-0`} />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.billing?.phone && (
          <div className={`flex items-center text-sm text-gray-600`}>
            <Phone className={`w-4 h-4 mr-2 text-gray-400 flex-shrink-0`} />
            <span>{customer.billing.phone}</span>
          </div>
        )}
        {customer.billing?.city && (
          <div className={`flex items-center text-sm text-gray-600`}>
            <MapPin className={`w-4 h-4 mr-2 text-gray-400 flex-shrink-0`} />
            <span className="truncate">
              {customer.billing.city}, {customer.billing.country}
            </span>
          </div>
        )}
      </div>

      {/* Order History Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className={`text-sm font-medium text-gray-900 mb-2`}>
          Recent Orders
        </h4>
        {isLoadingOrders ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : ordersData?.data?.length > 0 ? (
          <div className="space-y-2">
            {ordersData.data.map(order => (
              <div key={order.id} className={`flex items-center justify-between text-xs`}>
                <div className={`flex items-center gap-2`}>
                  <ShoppingBag className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">#{order.id}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{format(new Date(order.date_created), 'MMM d, yyyy')}</span>
                </div>
                <div className={`flex items-center gap-2`}>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {order.status}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency ? formatCurrency(order.total) : order.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-xs text-gray-500 ${'text-right'}`}>
            {t('noOrders') || 'No orders found'}
          </p>
        )}
      </div>

      {/* Shipping Method */}
      {shippingMethod && (
        <div className={`mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-600 ${'flex-row-reverse'}`}>
          <Truck className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">{t('shippingMethod') || 'Shipping'}:</span>
          <span className="truncate">{shippingMethod}</span>
        </div>
      )}

      {customer.date_created && (
        <div className={`mt-4 pt-4 border-t border-gray-200`}>
          <p className="text-xs text-gray-500">
            {format(new Date(customer.date_created), 'MMM yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(CustomerCard);


