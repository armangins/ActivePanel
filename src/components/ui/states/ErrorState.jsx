import { ExclamationCircleIcon as AlertCircle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';
import Card from '../cards/Card';

/**
 * ErrorState Component
 * 
 * Reusable error display component with retry option.
 * 
 * @param {string} error - Error message to display
 * @param {Function} onRetry - Function to call when retry button is clicked
 * @param {string} title - Optional custom title
 * @param {boolean} showRetry - Whether to show retry button (default: true)
 */
const ErrorState = ({ error, onRetry, title, showRetry = true, fullPage = false }) => {
  const { t } = useLanguage();

  const content = (
    <Card>
      <div className={`text-center py-8`}>
        <AlertCircle className="mx-auto w-12 h-12 text-orange-500 mb-4" />
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
        <p className="text-orange-600 mb-4">{error}</p>
        <p className="text-sm text-gray-600 mb-4">
          {t('checkSettings') || 'Please check your settings and try again.'}
        </p>
        {showRetry && onRetry && (
          <button onClick={onRetry} className="btn-primary">
            {t('retry')}
          </button>
        )}
      </div>
    </Card>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center p-10 h-[80vh]">
        <div className="w-full max-w-md">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ErrorState;

