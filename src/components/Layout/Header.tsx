import React from 'react';
import {
  MenuOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Layout, Button, theme, Grid } from 'antd';
import { useHeaderLogic } from './hooks/useHeaderLogic';
import ConnectionStatus from './ConnectionStatus';
import { OrderDetailsModal } from '@/features/orders';
import UserMenuDropdown from './UserMenuDropdown';
import NotificationDropdown from './NotificationDropdown';
import HeaderSearch from './HeaderSearch';

const { Header: AntHeader } = Layout;
const { useToken } = theme;
const { useBreakpoint } = Grid;

interface HeaderProps {
  onMenuClick: () => void;
  onCollapseToggle: () => void;
  isCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onCollapseToggle, isCollapsed }) => {
  const { token } = useToken();
  const screens = useBreakpoint();

  const {
    // State
    isRefreshing,
    selectedOrder,
    notificationOpen,
    mobileSearchOpen,
    setNotificationOpen,
    setMobileSearchOpen,

    // Data
    user,
    newOrders,
    newOrdersCount,
    isLoadingNotifications,

    // Context/Utils
    t,
    isRTL,

    // Handlers
    handleLogout,
    handleRefresh,
    handleOrderClick,
    handleModalClose,
    removeOrder,
    clearAllNotifications,
  } = useHeaderLogic();

  return (
    <AntHeader style={{
      background: token.colorBgContainer,
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 10,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      height: 64,
      flexDirection: isRTL ? 'row-reverse' : 'row'
    }}>
      {/* 1. Mobile Menu Toggle */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onMenuClick}
        style={{ display: !screens.lg ? 'flex' : 'none', fontSize: '16px', width: 64, height: 64 }}
      />

      {/* 2. User Profile */}
      <UserMenuDropdown
        user={user}
        onLogout={handleLogout}
      />

      {/* Mobile Spacer (Pushes items right) */}
      {!screens.lg && <div style={{ flex: 1 }} />}

      {/* 3. Actions Group: Refresh & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Refresh */}
        <Button
          type="text"
          icon={<ReloadOutlined spin={isRefreshing} />}
          onClick={handleRefresh}
          title={t('refresh')}
          style={{ width: 40, height: 40, color: token.colorTextSecondary }}
        />

        {/* Notifications */}
        <NotificationDropdown
          newOrdersCount={newOrdersCount}
          newOrders={newOrders}
          isLoading={isLoadingNotifications}
          onOrderClick={handleOrderClick}
          removeOrder={removeOrder}
          clearAllNotifications={clearAllNotifications}
          isOpen={notificationOpen}
          setIsOpen={setNotificationOpen}
        />
      </div>

      {/* 4. Global Search */}
      <HeaderSearch
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
      />

      {/* 5. Desktop Spacer */}
      {screens.lg && <div style={{ flex: 1 }} />}

      {/* 6. Desktop Collapse Toggle (Far Right/End) */}
      <Button
        type="text"
        icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onCollapseToggle}
        style={{ display: window.innerWidth >= 1024 ? 'flex' : 'none', fontSize: '16px', width: 64, height: 64 }}
      />

      {/* Connection Status (Hidden) */}
      <div style={{ display: 'none' }}><ConnectionStatus /></div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        orderId={selectedOrder?.id}
        onClose={handleModalClose}
      />
    </AntHeader>
  );
};

export default Header;
