import { AlertCircle } from 'lucide-react';

/**
 * ErrorState Component for Coupons
 */
const ErrorState = ({ error, onRetry, t }) => {
  return (
    <div className="card">
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('error') || 'Error'}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            {t('tryAgain') || 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;


