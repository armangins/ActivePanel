import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DashboardHeader Component
 * 
 * Displays the dashboard header with title and welcome message.
 * 
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const DashboardHeader = ({ t, isRTL }) => {
  return (
    <div className={'text-right'}>
      <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
      <p className="text-gray-600 mt-1">{t('welcome')}</p>
    </div>
  );
};

export default DashboardHeader;





