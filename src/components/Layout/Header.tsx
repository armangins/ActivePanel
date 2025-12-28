import React from 'react';
import {
  MenuOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Layout, Button, theme } from 'antd';
import { useHeaderLogic } from './hooks/useHeaderLogic';
import { useResponsive } from '@/hooks/useResponsive';
import ConnectionStatus from './ConnectionStatus';
import { OrderDetailsModal } from '@/features/orders';
import UserMenuDropdown from './UserMenuDropdown';
import NotificationDropdown from './NotificationDropdown';
import HeaderSearch from './HeaderSearch';

const { Header: AntHeader } = Layout;
const { useToken } = theme;

interface HeaderProps {
  onMenuClick: () => void;
  onCollapseToggle: () => void;
  isCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onCollapseToggle, isCollapsed }) => {
  const { token } = useToken();
  const { isDesktop, isMobile } = useResponsive();

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
      height: 64
      // Natural RTL flow: Start=Right, End=Left
    }}>
      {/* 1. Menu Toggles (Start/Right) */}
      <Button
        type="text"
        shape="circle"
        icon={<MenuOutlined />}
        onClick={onMenuClick}
        style={{
          display: !isDesktop ? 'flex' : 'none',
          fontSize: '16px',
          width: 40,
          height: 40,
          color: token.colorTextSecondary,
          border: `1px solid ${token.colorBorderSecondary}`
        }}
      />

      <Button
        type="text"
        icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onCollapseToggle}
        style={{ display: isDesktop ? 'flex' : 'none', fontSize: '16px', width: 64, height: 64 }}
      />

      {/* 2. Spacer (Pushes remaining items to End/Left) */}
      <div style={{ flex: 1 }} />

      {/* 3. Global Search */}
      <HeaderSearch
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
      />

      {/* 4. Actions Group: Refresh & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Refresh */}
        {!isMobile && (
          <Button
            type="text"
            shape="circle"
            icon={<ReloadOutlined spin={isRefreshing} />}
            onClick={handleRefresh}
            title={t('refresh')}
            style={{ width: 40, height: 40, color: token.colorTextSecondary, border: `1px solid ${token.colorBorderSecondary}` }}
          />
        )}

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

      {/* 5. User Profile (End/Left) */}
      <UserMenuDropdown
        user={user}
        onLogout={handleLogout}
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
