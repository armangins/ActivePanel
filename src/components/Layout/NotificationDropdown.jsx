import { XMarkIcon as X, CubeIcon as Package } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { DataPlaceholder, Button } from '../ui';
import { formatRelativeDate } from '../../utils/dateHelpers';
import { getCustomerName } from '../../utils/orderHelpers';

/**
 * Notification Dropdown Component
 * 
 * Displays list of new orders as notifications with read/unread states.
 */
const NotificationDropdown = ({
  isOpen,
  onClose,
  orders,
  isLoading,
  hasError,
  onOrderClick,
  onMarkAsRead,
  onMarkAsUnread,
  onRemoveOrder,
  onMarkAllAsRead,
  onClearAll,
  formatCurrency,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-row-reverse">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('notifications') || 'התראות'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-[18px] h-[18px]" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {hasError || isLoading ? (
            <DataPlaceholder
              message={t('dataOnTheWay') || 'הנתונים בדרך'}
              subMessage={hasError ? (t('checkingConnection') || 'בודק חיבור...') : (t('loadingData') || 'טוען נתונים...')}
              showSpinner={isLoading}
            />
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">
                {t('noNewOrders') || 'אין הזמנות חדשות'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.slice(0, 10).map((order) => {
                const isUnread = !order.read;
                return (
                  <NotificationItem
                    key={order.id}
                    order={order}
                    isUnread={isUnread}
                    onOrderClick={onOrderClick}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAsUnread={onMarkAsUnread}
                    onRemoveOrder={onRemoveOrder}
                    formatCurrency={formatCurrency}
                    t={t}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex gap-2 flex-row-reverse">
            <Button
              variant="link"
              onClick={() => {
                navigate('/orders');
                onClose();
              }}
              className="flex-1 text-sm text-primary-500 hover:text-primary-600 font-medium text-center h-auto p-0"
            >
              {t('viewAllOrders') || 'צפה בכל ההזמנות'}
            </Button>
            {orders.some(o => !o.read) && (
              <Button
                variant="link"
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 h-auto"
              >
                {t('markAllAsRead') || 'סמן הכל כנקרא'}
              </Button>
            )}
            <Button
              variant="link"
              onClick={onClearAll}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 h-auto"
            >
              {t('clearAll') || 'נקה הכל'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Notification Item Component
 */
const NotificationItem = ({
  order,
  isUnread,
  onOrderClick,
  onMarkAsRead,
  onMarkAsUnread,
  onRemoveOrder,
  formatCurrency,
  t,
}) => {
  return (
    <div
      className={`group relative px-4 py-3 transition-colors ${isUnread
        ? 'bg-blue-50 hover:bg-blue-100'
        : 'hover:bg-gray-50'
        }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOrderClick(order.id)}
        onKeyDown={(e) => e.key === 'Enter' && onOrderClick(order.id)}
        className="w-full cursor-pointer text-right"
      >
        <div className="flex items-start gap-3 flex-row-reverse">
          {/* Text Content */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-2 mb-1 justify-end flex-row-reverse">
              <span className={`text-sm font-bold text-right ${isUnread ? 'text-gray-900' : 'text-gray-700'
                }`}>
                {isUnread ? (t('newOrder') || 'הזמנה חדשה') : t('order')} #{order.number || order.id}
              </span>
              {isUnread && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
              )}
            </div>
            <p className={`text-sm mb-1 ${isUnread ? 'text-gray-700' : 'text-gray-600'
              }`}>
              {getCustomerName(order, t)}
            </p>
            <div className="flex items-center justify-between gap-2 flex-row-reverse">
              <p className="text-sm font-semibold text-primary-500">
                {formatCurrency(order.total || 0)}
              </p>
              <span className="text-xs text-gray-500">
                {formatRelativeDate(order.date_created || order.date_created_gmt)}
              </span>
            </div>
          </div>

          {/* Icon Container */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUnread
            ? 'bg-green-100 border border-green-200'
            : 'bg-gray-100 border border-gray-200'
            }`}>
            <Package
              className={`w-5 h-5 ${isUnread ? 'text-green-600' : 'text-gray-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
        {order.read && (
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsUnread(order.id);
            }}
            className="px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors h-auto"
            title={t('markAsUnread') || 'סמן כלא נקרא'}
          >
            {t('markAsUnread') || 'סמן כלא נקרא'}
          </Button>
        )}
        {!order.read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(order.id);
            }}
            className="p-1 text-gray-400 hover:text-blue-500 w-6 h-6"
            title={t('markAsRead') || 'סמן כנקרא'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveOrder(order.id);
          }}
          className="p-1 text-gray-400 hover:text-orange-500 w-6 h-6"
          title={t('removeNotification') || 'הסר התראה'}
        >
          <X className="w-[14px] h-[14px]" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationDropdown;

