import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon as LayoutDashboard,
  CubeIcon as Package,
  ShoppingCartIcon as ShoppingCart,
  UsersIcon as Users,
  Cog6ToothIcon as Settings,
  TicketIcon as Ticket,
  FolderIcon as Folder,
  CalculatorIcon as Calculator,
  ArrowUpTrayIcon as Upload,
  XMarkIcon as X,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import useNewOrdersCount from '../../hooks/useNewOrdersCount';
import { Button } from '../ui';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { newOrdersCount, resetCount, isLoading, hasError } = useNewOrdersCount();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't auto-reset when navigating to orders page - keep notifications until manually cleared

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
    {
      path: '/orders',
      icon: ShoppingCart,
      label: t('orders'),
      badge: (!hasError && !isLoading) ? newOrdersCount : null,
      isLoading: isLoading,
      hasError: hasError
    },
    { path: '/customers', icon: Users, label: t('customers') },
    { path: '/coupons', icon: Ticket, label: t('coupons') },
    { path: '/categories', icon: Folder, label: t('categories') || 'Categories' },
    { path: '/calculator', icon: Calculator, label: t('calculator') || 'מחשבון' },
    { path: '/imports', icon: Upload, label: t('imports') || 'ייבוא' },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-40
          ${isExpanded ? 'w-64' : 'w-20'} bg-white border-l border-gray-200
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 sidebar-open' : 'translate-x-full lg:translate-x-0 sidebar-closed'}
          flex flex-col lg:z-auto
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="hidden lg:flex text-gray-500 hover:text-primary-500 hover:bg-gray-100"
              title={isCollapsed ? t('expandSidebar') || 'Expand Sidebar' : t('collapseSidebar') || 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-500 hover:text-primary-500"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 text-right">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasBadge = item.badge !== undefined && item.badge > 0;

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
                  transition-colors duration-200 relative font-regular
                  ${isActive
                    ? 'text-primary-500 active'
                    : 'text-gray-700'
                  }
                `}
                style={isActive ? { backgroundColor: '#EBF3FF' } : {}}
                title={!isExpanded ? item.label : ''}
              >
                <div className="relative flex-shrink-0">
                  <Icon
                    className="w-5 h-5"
                    style={isActive ? { color: '#4560FF' } : {}}
                  />
                  {item.isLoading && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                  {item.hasError && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                  )}
                  {hasBadge && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <span
                    className="text-right transition-opacity duration-300 opacity-100 flex-1 mr-2 font-regular"
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

