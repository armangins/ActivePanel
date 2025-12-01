import { Link, useLocation } from 'react-router-dom';
import { 
  Squares2X2Icon as LayoutDashboard, 
  CubeIcon as Package, 
  ShoppingCartIcon as ShoppingCart, 
  UsersIcon as Users, 
  Cog6ToothIcon as Settings,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';

/**
 * MobileBottomNav Component
 * 
 * Bottom navigation bar for mobile devices.
 * Provides quick access to main sections of the app.
 * Only visible on mobile devices (< 1024px).
 */
const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { newOrdersCount } = useNewOrdersCount();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/products', icon: Package, label: t('products') },
    { 
      path: '/orders', 
      icon: ShoppingCart, 
      label: t('orders'),
      badge: newOrdersCount > 0 ? newOrdersCount : null,
    },
    { path: '/customers', icon: Users, label: t('customers') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 z-30 shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        margin: 0,
        width: '100%'
      }}
    >
      <div className="flex items-center justify-around h-16 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (location.pathname.startsWith(item.path) && item.path !== '/dashboard');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                relative touch-manipulation
                transition-colors duration-200
                px-2
                ${isActive ? 'text-primary-500' : 'text-gray-500'}
              `}
            >
              <div className="relative flex items-center justify-center mb-0.5">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight text-center max-w-full truncate px-1">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-500 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
