import {
  MenuOutlined as Menu,
  BellOutlined as Bell,
  ReloadOutlined as RefreshCw,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Button } from 'antd';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '@/features/auth';
import ConnectionStatus from './ConnectionStatus';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';
import { UserAvatar } from '../ui';
import GlobalSearch from './GlobalSearch';
import { refreshAllData } from '../../utils/refreshHelpers';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';
import { OrderDetailsModal } from '@/features/orders';

const Header = ({ onMenuClick, onCollapseToggle, isCollapsed }) => {
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
    // Close menu first to prevent UI issues
    setShowUserMenu(false);

    try {
      // Wait for logout to complete (clears tokens, calls API, etc.)
      await logout();

      // Navigate to login page after logout completes
      // Use replace: true to prevent back button from going back to authenticated pages
      navigate('/login', { replace: true });
    } catch (error) {
      // Ensure menu is closed even on error
      setShowUserMenu(false);

      // Still navigate to login page to ensure user is logged out from UI perspective
      // The AuthContext logout function already clears local state in finally block
      // This ensures the user is logged out even if the API call fails
      navigate('/login', { replace: true });
    }
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
    <header style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        padding: '0 16px',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        {/* Mobile menu button */}
        <Button
          type="text"
          icon={<Menu />}
          onClick={onMenuClick}
          style={{
            display: window.innerWidth < 1024 ? 'flex' : 'none',
            fontSize: '16px',
            width: 64,
            height: 64
          }}
        />

        {/* User Menu - Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleMenuToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px 8px 0',
              borderRight: isRTL ? 'none' : '1px solid #e5e7eb',
              borderLeft: isRTL ? '1px solid #e5e7eb' : 'none',
              background: 'none',
              borderTop: 'none',
              borderBottom: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="User menu"
          >
            <UserAvatar
              src={user?.picture}
              alt={user?.name || 'User'}
              name={user?.name}
              size="md"
            />
            <div style={{
              display: window.innerWidth >= 768 ? 'block' : 'none',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>
                {user?.name || t('adminUser')}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </button>
          <UserMenuDropdown
            isOpen={showUserMenu}
            onClose={handleBackdropClick}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            padding: '8px',
            color: '#6b7280',
            background: 'none',
            border: 'none',
            borderRadius: '8px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#4560FF';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
          title={t('refresh') || 'רענון'}
        >
          <RefreshCw style={{ fontSize: '20px' }} spin={isRefreshing} />
        </button>

        {/* Notifications - Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleNotificationClick}
            style={{
              position: 'relative',
              padding: '8px',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#4560FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Bell style={{ fontSize: '20px' }} />
            {newOrdersCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: '#f97316',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {newOrdersCount > 99 ? '99+' : newOrdersCount}
              </span>
            )}
          </button>
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

        {/* Global Search */}
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <GlobalSearch placeholder={t('search')} isRTL={isRTL} />
        </div>

        {/* Spacer to push toggle to the right */}
        <div style={{ flex: 1 }} />

        {/* Desktop collapse toggle */}
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapseToggle}
          style={{
            display: window.innerWidth >= 1024 ? 'flex' : 'none',
            fontSize: '16px',
            width: 64,
            height: 64
          }}
        />

        {/* Connection Status - Hidden or moved to end */}
        <div style={{ display: 'none' }}>
          <ConnectionStatus />
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

