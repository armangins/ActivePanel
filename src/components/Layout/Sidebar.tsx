import React from 'react';
import {
  CloseOutlined as X,
  EditOutlined,
} from '@ant-design/icons';
import { Layout, Typography, Drawer, Button as AntButton, theme } from 'antd';
import { useSidebarLogic } from './hooks/useSidebarLogic';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';

const { Sider } = Layout;
const { Text } = Typography;
const { useToken } = theme;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCollapseChange?: (collapsed: boolean) => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed: externalCollapsed }) => {
  const { token } = useToken();
  const {
    t,
    isRTL,
    openKeys,
    setOpenKeys,
    isCollapsed,
    isMobile,
    pendingOrdersCount,
    handleMenuClick,
    selectedKeys
  } = useSidebarLogic({ onClose, externalCollapsed });

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: 16,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <AntButton
            type="text"
            size="small"
            icon={<X />}
            style={{
              color: token.colorText,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onClose}
          />
        </div>
      )}

      {/* Logo Section */}
      <SidebarLogo isCollapsed={!!isCollapsed} isRTL={isRTL} />

      {/* Menu */}
      <SidebarMenu
        t={t}
        isRTL={isRTL}
        isCollapsed={!!isCollapsed}
        pendingOrdersCount={pendingOrdersCount}
        openKeys={openKeys}
        setOpenKeys={setOpenKeys}
        selectedKeys={selectedKeys}
        onMenuClick={handleMenuClick}
      />

      {/* Footer - Custom Trigger */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }}>
        {!isCollapsed && (
          <>
            <Text style={{ fontSize: 14, color: token.colorTextSecondary, flex: 1 }}>
              Custom trigger
            </Text>
            <EditOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
          </>
        )}
      </div>
    </div>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer
        title={null}
        placement={isRTL ? 'right' : 'left'}
        onClose={onClose}
        open={isOpen}
        width={256}
        closable={false}
        styles={{ body: { padding: 0, background: token.colorBgContainer } }}
        style={{ zIndex: 1000 }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: Use Sider
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={isCollapsed}
      width={256}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        direction: isRTL ? 'rtl' : 'ltr',
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
        zIndex: 100
      }}
      theme="light"
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
