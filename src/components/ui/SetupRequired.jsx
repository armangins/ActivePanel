import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Component to display when WooCommerce settings are not configured
 */
export const SetupRequired = ({ title, description }) => {
  const { t } = useLanguage();

  return (
    <div className="card p-8 text-center" dir="rtl">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {title || t('welcomeToDashboard') || 'ברוכים הבאים'}
        </h2>
        <p className="text-gray-600 mb-6">
          {description || t('configureWooCommerceSettings') || 'כדי להתחיל, אנא הגדר את הגדרות WooCommerce שלך.'}
        </p>
        <Link
          to="/settings"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('goToSettings') || 'עבור להגדרות'}
        </Link>
      </div>
    </div>
  );
};

