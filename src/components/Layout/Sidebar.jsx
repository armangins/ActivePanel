import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CalculatorOutlined as Calculator,
  CloseOutlined as X,
  EditOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  SettingOutlined,
  DollarOutlined,
  FolderOutlined,
  UploadOutlined
} from '@ant-design/icons';

import { useLanguage } from '../../contexts/LanguageContext';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';
import { Layout, Menu, Badge, Typography, Drawer, Button as AntButton } from 'antd';
const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ isOpen, onClose, onCollapseChange, isCollapsed: externalCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { newOrdersCount, isLoading, hasError } = useNewOrdersCount();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const [openKeys, setOpenKeys] = useState(() => {
    // Open products submenu if we're on a products-related page
    return location.pathname.startsWith('/products') ? ['/products'] : [];
  });

  // Update openKeys when location changes
  useEffect(() => {
    if (location.pathname.startsWith('/products')) {
      setOpenKeys(['/products']);
    }
  }, [location.pathname]);


  const menuItems = [
    { 
      key: '/dashboard', 
      icon: <DashboardOutlined />, 
      label: t('dashboard'),
      'data-onboarding': 'dashboard-nav'
    },
    { 
      key: '/products',
      icon: <ShoppingOutlined />, 
      label: t('products'),
      'data-onboarding': 'products-nav',
      children: [
        {
          key: '/products/list',
          label: 'כל המוצרים'
        },
        {
          key: '/products/add',
          label: 'הוסף מוצר חדש'
        }
      ]
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {t('orders')}
          {(!hasError && !isLoading && newOrdersCount > 0) && (
            <Badge count={newOrdersCount > 99 ? '99+' : newOrdersCount} style={{ backgroundColor: '#ff4d4f' }} />
          )}
        </span>
      ),
      'data-onboarding': 'orders-nav'
    },
    { key: '/customers', icon: <TeamOutlined />, label: t('customers') },
    { key: '/coupons', icon: <DollarOutlined />, label: t('coupons') },
    { key: '/categories', icon: <FolderOutlined />, label: t('categories') || 'Categories' },
    { key: '/calculator', icon: <Calculator />, label: t('calculator') || 'מחשבון' },
    { key: '/imports', icon: <UploadOutlined />, label: t('imports') || 'ייבוא' },
    { key: '/settings', icon: <SettingOutlined />, label: t('settings'), 'data-onboarding': 'settings-nav' },
  ];

  const handleMenuClick = ({ key }) => {
    // Map menu keys to actual routes
    const routeMap = {
      '/products/list': '/products',
      '/products/add': '/products/add'
    };
    
    const route = routeMap[key] || key;
    navigate(route);
    
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mobile Close Button */}
      {window.innerWidth < 1024 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          padding: 16,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <AntButton
            type="text"
            size="small"
            icon={<X />}
            style={{ 
              color: '#fff',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onClose}
          />
        </div>
      )}

      {/* Logo Section */}
      <div style={{
        padding: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : (isRTL ? 'flex-end' : 'flex-start'),
        minHeight: 64
      }}>
        {isCollapsed ? (
          <img 
            src="/logo.svg" 
            alt="Logo" 
            style={{ 
              width: 40, 
              height: 40,
              objectFit: 'contain'
            }} 
          />
        ) : (
          <img 
            src="/logo.svg" 
            alt="Logo" 
            style={{ 
              height: 40,
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        )}
      </div>

      {/* Custom styles for menu active item */}
      <style>{`
        .ant-menu-dark .ant-menu-item-selected {
          background-color: #007bff !important;
        }
        .ant-menu-dark .ant-menu-item-selected > * {
          color: #fff !important;
        }
        .ant-menu-dark .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
        .ant-menu-dark .ant-menu-submenu-title:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
      
      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[
          location.pathname === '/products' ? '/products/list' : location.pathname
        ]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          borderRight: 0,
          flex: 1,
          direction: isRTL ? 'rtl' : 'ltr',
          background: 'transparent',
          color: '#fff'
        }}
        inlineCollapsed={isCollapsed}
        theme="dark"
      />

      {/* Footer - Custom Trigger */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#0f172a',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
        flexDirection: isRTL ? 'row-reverse' : 'row'
      }}>
        {!isCollapsed && (
          <>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', flex: 1 }}>
              Custom trigger
            </Text>
            <EditOutlined style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }} />
          </>
        )}
      </div>
    </div>
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        bodyStyle={{ padding: 0, background: '#1e293b' }}
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
        background: '#1e293b'
      }}
      theme="dark"
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
