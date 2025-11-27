import { useLanguage } from '../../contexts/LanguageContext';

/**
 * LoadingState Component
 * 
 * Displays a loading indicator for the dashboard.
 * 
 * @param {Function} t - Translation function
 */
const LoadingState = ({ t }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
};

export default LoadingState;


