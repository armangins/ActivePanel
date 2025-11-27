import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * RecentOrdersTable Component
 * 
 * Displays a table of recent orders with order details.
 * 
 * @param {Array} orders - Array of order objects
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const RecentOrdersTable = ({ orders, formatCurrency, t, isRTL }) => {
  if (orders.length === 0) {
    return (
      <p className={`text-gray-500 text-center py-8 ${'text-right'}`}>
        {t('noOrders')}
      </p>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'text-primary-500';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'processing') {
      return { backgroundColor: '#EBF3FF' };
    }
    return {};
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className={`${'text-right'} py-3 px-4 text-sm font-medium text-gray-700`}>
              {t('order')} ID
            </th>
            <th className={`${'text-right'} py-3 px-4 text-sm font-medium text-gray-700`}>
              {t('customer')}
            </th>
            <th className={`${'text-right'} py-3 px-4 text-sm font-medium text-gray-700`}>
              {t('date')}
            </th>
            <th className={`${'text-right'} py-3 px-4 text-sm font-medium text-gray-700`}>
              {t('status')}
            </th>
            <th className={`${'text-right'} py-3 px-4 text-sm font-medium text-gray-700`}>
              {t('total')}
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className={`py-3 px-4 text-sm text-gray-900 ${'text-right'}`}>
                #{order.id}
              </td>
              <td className={`py-3 px-4 text-sm text-gray-700 ${'text-right'}`}>
                {order.billing?.first_name || ''} {order.billing?.last_name || ''}
                {!order.billing?.first_name && !order.billing?.last_name && (
                  <span className="text-gray-400">{t('guest') || 'Guest'}</span>
                )}
              </td>
              <td className={`py-3 px-4 text-sm text-gray-700 ${'text-right'}`}>
                {format(new Date(order.date_created), 'dd/MM/yyyy')}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                  style={getStatusStyle(order.status)}
                >
                  {t(order.status) || order.status}
                </span>
              </td>
              <td className={`py-3 px-4 text-sm font-medium text-gray-900 ${'text-right'}`}>
                {formatCurrency(parseFloat(order.total || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;


