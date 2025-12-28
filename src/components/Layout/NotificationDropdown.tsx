import React from 'react';
import { BellOutlined, InboxOutlined } from '@ant-design/icons';
import { Popover, Badge, Button, List, Empty, Spin, Avatar, Space, Typography, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatRelativeDate } from '@/utils/dateHelpers';
import { getCustomerName } from '@/utils/orderHelpers';

const { Text } = Typography;
const { useToken } = theme;

interface NotificationDropdownProps {
  newOrdersCount: number;
  newOrders: any[];
  isLoading: boolean;
  onOrderClick: (id: string | number) => void;
  removeOrder: (id: string | number) => void;
  clearAllNotifications: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  newOrdersCount,
  newOrders,
  isLoading,
  onOrderClick,
  removeOrder,
  clearAllNotifications,
  isOpen,
  setIsOpen
}) => {
  const { t, formatCurrency } = useLanguage();
  const { token } = useToken();
  const navigate = useNavigate();

  const handleOrderClick = (orderId: string | number) => {
    onOrderClick(orderId);
  };

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
            renderItem={(order: any) => (
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
          <Button type="link" onClick={() => { navigate('/orders'); setIsOpen(false); }}>
            {t('viewAllOrders') || 'View All Orders'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      placement="bottomRight"
      open={isOpen}
      onOpenChange={setIsOpen}
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
  );
};

export default NotificationDropdown;
