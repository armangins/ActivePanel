/**
 * LoadingState Component
 * 
 * Displays loading spinner while orders are being fetched.
 * 
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const LoadingState = ({ isRTL, t }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('loading') || 'Loading orders...'}</p>
      </div>
    </div>
  );
};

export default LoadingState;


