import React from 'react';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Avatar, Typography, theme, Grid } from 'antd';
import type { MenuProps } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

interface UserMenuDropdownProps {
  user: any;
  onLogout: () => void;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  user,
  onLogout,
}) => {
  const { t, isRTL } = useLanguage();
  const { token } = useToken();
  const screens = useBreakpoint();

  const userMenuItems: MenuProps['items'] = [
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
      onClick: onLogout,
    },
  ];

  return (
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
        <div style={{ display: screens.md ? 'block' : 'none', textAlign: isRTL ? 'right' : 'left' }}>
          <Text strong style={{ display: 'block', lineHeight: 1.2 }}>{user?.name || t('adminUser')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email || 'admin@example.com'}</Text>
        </div>
      </div>
    </Dropdown>
  );
};

export default UserMenuDropdown;
