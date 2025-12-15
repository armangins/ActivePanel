import { LogoutOutlined as LogOut } from '@ant-design/icons';
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
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const handleDropdownClick = (e) => {
    // Prevent backdrop from closing dropdown when clicking inside
    e.stopPropagation();
  };

  const handleLogoutClick = (e) => {
    // Stop propagation to prevent backdrop from closing dropdown before logout completes
    e.stopPropagation();
    e.preventDefault();
    // Close dropdown first to prevent UI issues
    onClose();
    // Call logout handler (which is async and will handle navigation)
    onLogout();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        onClick={handleDropdownClick}
        style={{
          position: 'absolute',
          [isRTL ? 'right' : 'left']: 0,
          marginTop: '8px',
          width: '224px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          paddingTop: '8px',
          paddingBottom: '8px',
          zIndex: 50
        }}
      >
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            textAlign: 'right',
            margin: 0
          }}>
            {user?.name || t('adminUser')}
          </p>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'right',
            margin: 0
          }}>
            {user?.email || 'admin@mail.com'}
          </p>
        </div>
        <Button
          onClick={handleLogoutClick}
          variant="ghost"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            color: '#ea580c',
            textAlign: 'right',
            borderRadius: '0 0 8px 8px',
            height: 'auto',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fff7ed';
            e.currentTarget.style.color = '#c2410c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ea580c';
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          <span style={{ fontWeight: 500 }}>{t('logout') || 'התנתק'}</span>
        </Button>
      </div>
    </>
  );
};

export default UserMenuDropdown;

