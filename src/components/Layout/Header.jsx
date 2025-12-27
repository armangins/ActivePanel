import React, { useState, useCallback } from 'react';
import {
  MenuOutlined,
  BellOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { Layout, Button, Dropdown, Popover, Badge, Avatar, Space, Typography, List, Empty, Spin, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '@/features/auth';
import ConnectionStatus from './ConnectionStatus';
import GlobalSearch from './GlobalSearch';
import { refreshAllData } from '../../utils/refreshHelpers';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';
import { OrderDetailsModal } from '@/features/orders';
import { formatRelativeDate } from '../../utils/dateHelpers';
import { getCustomerName } from '../../utils/orderHelpers';

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const { useToken } = theme;

const Header = ({ onMenuClick, onCollapseToggle, isCollapsed }) => {
  const { token } = useToken();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { t, formatCurrency, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    newOrdersCount,
    newOrders,
    removeOrder,
    clearAllNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    isLoading
  } = useNewOrdersCount();

  // Handlers
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      // Error handled by utils
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleOrderClick = useCallback((orderId) => {
    const latestOrder = newOrders.find(o => o.id === orderId);
    if (!latestOrder) return;
    setSelectedOrder(latestOrder);
    setNotificationOpen(false);
  }, [newOrders]);

  const handleStatusUpdate = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleModalClose = useCallback(() => {
    const currentOrder = newOrders.find(o => o.id === selectedOrder?.id);
    if (currentOrder && !currentOrder.read) {
      markAsRead(selectedOrder.id);
    }
    setSelectedOrder(null);
  }, [newOrders, selectedOrder, markAsRead]);

  // User Menu Items
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0', cursor: 'default' }}>
          <Text strong style={{ display: 'block' }}>{user?.name || t('adminUser')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email || 'admin@example.com'}</Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: token.colorError }} />,
      label: <Text type="danger">{t('logout') || 'Logout'}</Text>,
      onClick: handleLogout,
    },
  ];

  // Notification Content
  const notificationContent = (
    <div style={{ width: 350, maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong>{t('notifications') || 'Notifications'}</Text>
        <Space>
          {newOrders.length > 0 && (
            <Button type="link" size="small" onClick={clearAllNotifications} style={{ padding: 0 }}>
              {t('clearAll') || 'Clear All'}
            </Button>
          )}
        </Space>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>
        ) : newOrders.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('noNewOrders') || 'No new orders'} />
        ) : (
          <List
            dataSource={newOrders}
            renderItem={order => (
              <List.Item
                key={order.id}
                style={{
                  cursor: 'pointer',
                  padding: '12px',
                  background: !order.read ? token.colorPrimaryBg : 'transparent',
                  transition: 'background 0.3s'
                }}
                className="notification-item"
                onClick={() => handleOrderClick(order.id)}
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    size="small"
                    icon={<span style={{ fontSize: 16 }}>&times;</span>}
                    onClick={(e) => { e.stopPropagation(); removeOrder(order.id); }}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<InboxOutlined />}
                      style={{ backgroundColor: !order.read ? token.colorPrimary : token.colorBgContainerDisabled }}
                    />
                  }
                  title={
                    <Space size={4} style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong={!order.read}>
                        {t('order')} #{order.number || order.id}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatRelativeDate(order.date_created)}
                      </Text>
                    </Space>
                  }
                  description={
                    <div>
                      <div>{getCustomerName(order, t)}</div>
                      <Text type="success" strong>{formatCurrency(order.total)}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {newOrders.length > 0 && (
        <div style={{ padding: '8px 0', textAlign: 'center', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <Button type="link" onClick={() => { navigate('/orders'); setNotificationOpen(false); }}>
            {t('viewAllOrders') || 'View All Orders'}
          </Button>
        </div>
      )}
    </div>
  );

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
        style={{ display: window.innerWidth < 1024 ? 'flex' : 'none', fontSize: '16px', width: 64, height: 64 }}
      />

      {/* 2. User Profile (Was on Left/Start) */}
      <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement={isRTL ? "bottomLeft" : "bottomRight"}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 16px 8px 0',
            borderRight: isRTL ? 'none' : `1px solid ${token.colorBorderSecondary}`,
            borderLeft: isRTL ? `1px solid ${token.colorBorderSecondary}` : 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            color: token.colorText
          }}
          className="user-menu-trigger"
        >
          <Avatar src={user?.picture} icon={<UserOutlined />} size="default" />
          <div style={{ display: window.innerWidth >= 768 ? 'block' : 'none', textAlign: isRTL ? 'right' : 'left' }}>
            <Text strong style={{ display: 'block', lineHeight: 1.2 }}>{user?.name || t('adminUser')}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{user?.email || 'admin@example.com'}</Text>
          </div>
        </div>
      </Dropdown>

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
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          // overlayInnerStyle={{ padding: 0 }} // Deprecated
          styles={{ body: { padding: 0 } }}
        >
          <Badge count={newOrdersCount} offset={[-2, 2]} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 20 }} />}
              style={{ width: 40, height: 40, color: token.colorTextSecondary }}
            />
          </Badge>
        </Popover>
      </div>

      {/* 4. Global Search */}
      <div style={{ maxWidth: 400, width: '100%' }}>
        <GlobalSearch placeholder={t('search')} isRTL={isRTL} />
      </div>

      {/* 5. Spacer */}
      <div style={{ flex: 1 }} />

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
    </AntHeader>
  );
};

export default Header;
