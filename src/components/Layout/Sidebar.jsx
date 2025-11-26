import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/products', icon: Package, label: t('products') },
    { path: '/orders', icon: ShoppingCart, label: t('orders') },
    { path: '/customers', icon: Users, label: t('customers') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-30
          w-64 bg-white ${isRTL ? 'border-l' : 'border-r'} border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-2xl font-bold text-primary-600">WooCommerce</h1>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`
                  flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="font-medium text-gray-700">{t('adminPanel')}</p>
            <p className="text-xs mt-1">{t('version')} 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

