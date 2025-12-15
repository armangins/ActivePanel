import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Component to display when WooCommerce settings are not configured
 * Uses Ant Design Result component
 */
export const SetupRequired = ({ title, description }) => {
  const { t } = useLanguage();

  return (
    <Result
      status="info"
      title={title || t('welcomeToDashboard') || 'ברוכים הבאים'}
      subTitle={description || t('configureWooCommerceSettings') || 'כדי להתחיל, אנא הגדר את הגדרות WooCommerce שלך.'}
      extra={[
        <Link key="settings" to="/settings">
          <Button type="primary">
            {t('goToSettings') || 'עבור להגדרות'}
          </Button>
        </Link>
      ]}
    />
  );
};
