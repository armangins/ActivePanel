import { 
  ShoppingCartIcon as ShoppingCart, 
  ClockIcon as Clock, 
  CheckCircleIcon as CheckCircle, 
  XCircleIcon as XCircle, 
  ExclamationCircleIcon as AlertCircle, 
  ArrowPathIcon as RefreshCw 
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * OrderStatusCards Component
 * 
 * Displays cards showing the total number of orders for each status
 * 
 * @param {Object} statusCounts - Object with status counts { pending: 0, processing: 0, etc. }
 * @param {Function} onStatusClick - Callback when a status card is clicked
 * @param {string} selectedStatus - Currently selected status filter
 */
const OrderStatusCards = ({ statusCounts = {}, onStatusClick, selectedStatus }) => {
  const { t } = useLanguage();

  const statusConfig = [
    {
      key: 'all',
      label: t('allOrders') || 'כל ההזמנות',
      icon: ShoppingCart,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
      count: statusCounts.all || 0,
    },
    {
      key: 'pending',
      label: t('pending') || 'ממתין',
      icon: Clock,
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      count: statusCounts.pending || 0,
    },
    {
      key: 'processing',
      label: t('processing') || 'מתעבד',
      icon: RefreshCw,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
      count: statusCounts.processing || 0,
    },
    {
      key: 'on-hold',
      label: t('onHold') || 'מושהה',
      icon: AlertCircle,
      color: 'bg-orange-50',
      iconColor: 'text-orange-500',
      count: statusCounts['on-hold'] || 0,
    },
    {
      key: 'completed',
      label: t('completed') || 'הושלם',
      icon: CheckCircle,
      color: 'bg-green-50',
      iconColor: 'text-green-500',
      count: statusCounts.completed || 0,
    },
    {
      key: 'cancelled',
      label: t('cancelled') || 'בוטל',
      icon: XCircle,
      color: 'bg-orange-50',
      iconColor: 'text-orange-500',
      count: statusCounts.cancelled || 0,
    },
    {
      key: 'refunded',
      label: t('refunded') || 'הוחזר',
      icon: RefreshCw,
      color: 'bg-gray-50',
      iconColor: 'text-gray-500',
      count: statusCounts.refunded || 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {statusConfig.map((status) => {
        const Icon = status.icon;
        const isSelected = selectedStatus === status.key;
        
        return (
          <div
            key={status.key}
            onClick={() => onStatusClick && onStatusClick(status.key)}
            className={`card cursor-pointer hover:shadow-lg transition-all ${
              isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
            }`}
          >
            <div className="flex items-center flex-row-reverse justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1 text-right">{status.label}</p>
                <p className="text-2xl font-bold text-gray-900 text-right">{status.count}</p>
              </div>
              <div className={`p-3 ${status.color} rounded-lg flex-shrink-0`}>
                <Icon className={`${status.iconColor} w-5 h-5`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusCards;




