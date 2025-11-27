import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Ticket,
  Calculator,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setIsHovered(false);
    }
  };

  // Determine if sidebar should appear expanded (either not collapsed, or collapsed but hovered)
  const isExpanded = !isCollapsed || isHovered;

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/products', icon: Package, label: t('products') },
    { path: '/orders', icon: ShoppingCart, label: t('orders') },
    { path: '/customers', icon: Users, label: t('customers') },
    { path: '/coupons', icon: Ticket, label: t('coupons') },
    { path: '/calculator', icon: Calculator, label: t('calculator') || 'מחשבון' },
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
          fixed lg:static inset-y-0 right-0 z-30
          ${isExpanded ? 'w-64' : 'w-20'} bg-white border-l border-gray-200
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} p-6 border-b border-gray-200 flex-row-reverse`}>
          <div className="flex items-center justify-end w-full flex-row-reverse">
            <img 
              src="/logo.svg" 
              alt="ActivePanel" 
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="flex items-center flex-row-reverse gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex text-gray-500 hover:text-primary-500 p-1 rounded hover:bg-gray-100 transition-colors"
              title={isCollapsed ? t('expandSidebar') || 'Expand Sidebar' : t('collapseSidebar') || 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <button
              className="lg:hidden text-gray-500 hover:text-primary-500"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-right">
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
                  sidebar-menu-item flex items-center ${isExpanded ? '' : 'justify-center'} gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'text-primary-500 font-medium active' 
                    : 'text-gray-700'
                  }
                `}
                style={isActive ? { backgroundColor: '#EBF3FF' } : {}}
                title={!isExpanded ? item.label : ''}
              >
                <Icon 
                  size={20} 
                  style={isActive ? { color: '#4560FF' } : {}}
                />
                {isExpanded && (
                  <span 
                    className="text-right transition-opacity duration-300 opacity-100"
                    style={isActive ? { color: '#4560FF' } : {}}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 transition-opacity duration-300 opacity-100">
            <div className="text-sm text-gray-500 text-right">
              <p className="font-medium text-gray-700">{t('adminPanel')}</p>
              <p className="text-xs mt-1">{t('version')} 1.0.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

