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

/**
 * UserMenuDropdown Component
 * 
 * Displays the current user's avatar and a dropdown menu with user actions (Logout).
 */
const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  user,
  onLogout,
}) => {
  const { t, isRTL } = useLanguage();
  const { token } = useToken();

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
          cursor: 'pointer',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: '50%',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          backgroundColor: token.colorBgContainer
        }}
      >
        <Avatar src={user?.picture} icon={<UserOutlined />} size={36} />
      </div>
    </Dropdown>
  );
};

export default UserMenuDropdown;
