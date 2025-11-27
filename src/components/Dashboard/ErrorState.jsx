import { useLanguage } from '../../contexts/LanguageContext';

/**
 * ErrorState Component
 * 
 * Displays an error message with retry option for the dashboard.
 * 
 * @param {string} error - Error message to display
 * @param {Function} onRetry - Function to call when retry button is clicked
 * @param {Function} t - Translation function
 */
const ErrorState = ({ error, onRetry, t }) => {
  return (
    <div className="card">
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-600 mb-4">
          {t('checkSettings') || 'Please check your settings and try again.'}
        </p>
        <button onClick={onRetry} className="btn-primary">
          {t('retry')}
        </button>
      </div>
    </div>
  );
};

export default ErrorState;


