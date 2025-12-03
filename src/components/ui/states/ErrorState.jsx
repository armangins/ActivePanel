import { useLanguage } from '../../../contexts/LanguageContext';
import StatusMessage from './StatusMessage';

/**
 * ErrorState Component
 * 
 * Reusable error display component with retry option.
 * Wrapper around StatusMessage.
 */
const ErrorState = ({ error, onRetry, title, showRetry = true, fullPage = false }) => {
  const { t } = useLanguage();

  const defaultMessage = 'אופס, נראה שעדיין אין מידע להציג';

  // Map technical errors to friendly messages
  let displayError = error;
  if (error === 'Resource not found.' || error?.includes?.('Resource not found')) {
    displayError = defaultMessage;
  }

  const subMessage = t('checkSettings') || 'אנא בדוק את ההגדרות שלך ונסה שוב';

  return (
    <StatusMessage
      type="error"
      title={title}
      message={
        <>
          <span className="block font-medium mb-2">{displayError || defaultMessage}</span>
          <span className="block text-sm text-gray-500">{subMessage}</span>
        </>
      }
      action={showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary px-8 py-2.5 shadow-sm hover:shadow-md transition-all"
        >
          {t('retry')}
        </button>
      )}
      fullPage={fullPage}
    />
  );
};

export default ErrorState;

