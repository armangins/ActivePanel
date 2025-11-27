import { Loader } from 'lucide-react';

/**
 * LoadingState Component for Coupons
 */
const LoadingState = ({ t }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader size={48} className="mx-auto text-primary-500 animate-spin mb-4" />
        <p className="text-gray-600">{t('loading') || 'Loading...'}</p>
      </div>
    </div>
  );
};

export default LoadingState;


