import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ConnectionStatus from './ConnectionStatus';
import SearchInput from '../Common/SearchInput';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center flex-row-reverse justify-between">
        <div className="flex items-center space-x-4 flex-1 flex-row-reverse">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-primary-500"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('search')}
              isRTL={true}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 flex-row-reverse">
          <ConnectionStatus />
          
          <button className="relative p-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pr-4 pl-0 border-r border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-primary-500" />
                </div>
              )}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || t('adminUser')}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 text-right">{user?.name || t('adminUser')}</p>
                    <p className="text-xs text-gray-500 text-right">{user?.email || 'admin@mail.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex-row-reverse"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">{t('logout') || 'התנתק'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

