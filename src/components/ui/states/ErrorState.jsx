import { Result, Button as AntButton } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * ErrorState Component - Ant Design wrapper
 * 
 * Reusable error display component with retry option using Ant Design Result.
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

  const content = (
    <Result
      status="error"
      title={title || displayError || defaultMessage}
      subTitle={subMessage}
      extra={
        showRetry && onRetry ? (
          <AntButton type="primary" onClick={onRetry}>
            {t('retry') || 'נסה שוב'}
          </AntButton>
        ) : null
      }
    />
  );

  if (fullPage) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh', 
        padding: '24px' 
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ErrorState;
