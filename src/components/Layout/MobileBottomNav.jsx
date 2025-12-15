import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppstoreOutlined as LayoutDashboard, 
  InboxOutlined as Package, 
  ShoppingCartOutlined as ShoppingCart, 
  UserOutlined as Users, 
  SettingOutlined as Settings,
} from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';
import { Badge } from 'antd';

/**
 * MobileBottomNav Component
 * 
 * Bottom navigation bar for mobile devices.
 * Provides quick access to main sections of the app.
 * Only visible on mobile devices (< 1024px).
 */
const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { newOrdersCount } = useNewOrdersCount();

  const navItems = [
    { key: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { key: '/products', icon: Package, label: t('products') },
    { 
      key: '/orders', 
      icon: ShoppingCart, 
      label: t('orders'),
      badge: newOrdersCount > 0 ? newOrdersCount : null,
    },
    { key: '/customers', icon: Users, label: t('customers') },
    { key: '/settings', icon: Settings, label: t('settings') },
  ];

  const handleClick = (key) => {
    navigate(key);
  };

  return (
    <div
      style={{
        display: window.innerWidth < 1024 ? 'flex' : 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-around', 
        height: 64, 
        width: '100%' 
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.key || 
                          (location.pathname.startsWith(item.key) && item.key !== '/dashboard');
          
          return (
            <div
              key={item.key}
              onClick={() => handleClick(item.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                cursor: 'pointer',
                color: isActive ? '#4560FF' : '#8c8c8c',
                position: 'relative',
                padding: '4px 8px'
              }}
            >
              <div style={{ position: 'relative', marginBottom: 4 }}>
                {item.badge ? (
                  <Badge count={item.badge > 99 ? '99+' : item.badge} offset={[-5, 5]}>
                    <Icon style={{ fontSize: 20 }} />
                  </Badge>
                ) : (
                  <Icon style={{ fontSize: 20 }} />
                )}
              </div>
              <span style={{ 
                fontSize: 10, 
                fontWeight: 500, 
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 48,
                  height: 2,
                  background: '#4560FF',
                  borderRadius: '0 0 4px 4px'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
