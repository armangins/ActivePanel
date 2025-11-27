import { Loader } from 'lucide-react';

/**
 * LoadingMoreIndicator Component for Coupons
 */
const LoadingMoreIndicator = ({ isRTL }) => {
  return (
    <div className={`flex items-center justify-center py-4 ${'text-right'}`}>
      <Loader size={24} className="text-primary-500 animate-spin" />
    </div>
  );
};

export default LoadingMoreIndicator;


