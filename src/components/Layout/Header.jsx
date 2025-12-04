import {
  Bars3Icon as Menu,
  BellIcon as Bell,
  ArrowPathIcon as RefreshCw
} from '@heroicons/react/24/outline';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ConnectionStatus from './ConnectionStatus';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';
import { UserAvatar, Button } from '../ui';
import { refreshAllData } from '../../utils/refreshHelpers';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';
import OrderDetailsModal from '../Orders/OrderDetailsModal/OrderDetailsModal';

const Header = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { t, formatCurrency, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { newOrdersCount, newOrders, removeOrder, clearAllNotifications, markAsRead, markAsUnread, markAllAsRead, isLoading, hasError } = useNewOrdersCount();

  // Handlers
  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  }, [logout, navigate]);

  const handleMenuToggle = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const handleBackdropClick = useCallback(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleOrderClick = useCallback((orderId) => {
    const latestOrder = newOrders.find(o => o.id === orderId);
    if (!latestOrder) return;
    setSelectedOrder(latestOrder);
    setShowNotifications(false);
  }, [newOrders]);

  const handleStatusUpdate = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      setIsRefreshing(false);
    }
  }, []);

  const handleModalClose = useCallback(() => {
    const currentOrder = newOrders.find(o => o.id === selectedOrder?.id);
    if (currentOrder && !currentOrder.read) {
      markAsRead(selectedOrder.id);
    }
    setSelectedOrder(null);
  }, [newOrders, selectedOrder, markAsRead]);

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 md:py-4 sticky top-0 z-40">
      <div className="flex items-center flex-row-reverse justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 flex-row-reverse min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-primary-500 -m-2"
            aria-label={t('menu') || 'תפריט'}
          >
            <Menu className="w-6 h-6" />
          </Button>

          {/* Spacer to keep layout consistent if needed, or just remove search */}
          <div className="hidden sm:flex flex-1 max-w-md"></div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-row-reverse flex-shrink-0">
          {/* Connection Status - Hidden on mobile */}
          <div className="hidden md:block">
            <ConnectionStatus />
          </div>

          {/* Refresh - Smaller on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-gray-600 hover:text-primary-500 hover:bg-primary-50"
            title={t('refresh') || 'רענון'}
            aria-label={t('refresh') || 'רענון'}
          >
            <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative text-gray-600 hover:text-primary-500 hover:bg-primary-50"
              aria-label={t('notifications') || 'התראות'}
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              {newOrdersCount > 0 && (
                <span className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {newOrdersCount > 99 ? '99+' : newOrdersCount}
                </span>
              )}
            </Button>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={handleBackdropClick}
              orders={newOrders}
              isLoading={isLoading}
              hasError={hasError}
              onOrderClick={handleOrderClick}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onRemoveOrder={removeOrder}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAllNotifications}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* User Menu - Compact on mobile */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={handleMenuToggle}
              className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-4 pl-0 border-r border-gray-200 hover:bg-gray-50 rounded-lg p-2 h-auto"
              aria-label={t('userMenu') || 'תפריט משתמש'}
            >
              <UserAvatar
                src={user?.picture}
                alt={user?.name || 'User'}
                name={user?.name}
                size="md"
              />
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || t('adminUser')}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </Button>
            <UserMenuDropdown
              isOpen={showUserMenu}
              onClose={handleBackdropClick}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleModalClose}
          onStatusUpdate={handleStatusUpdate}
          formatCurrency={formatCurrency}
          isRTL={isRTL}
          t={t}
        />
      )}
    </header>
  );
};

export default Header;

