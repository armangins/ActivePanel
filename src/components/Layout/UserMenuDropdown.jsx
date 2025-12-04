import { ArrowRightOnRectangleIcon as LogOut } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * User Menu Dropdown Component
 * 
 * Displays user information and logout option.
 */
const UserMenuDropdown = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900 text-right">
            {user?.name || t('adminUser')}
          </p>
          <p className="text-xs text-gray-500 text-right">
            {user?.email || 'admin@mail.com'}
          </p>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full flex items-center justify-start gap-2 px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors text-right rounded-none rounded-b-lg h-auto"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">{t('logout') || 'התנתק'}</span>
        </Button>
      </div>
    </>
  );
};

export default UserMenuDropdown;

