import { Tag } from 'lucide-react';

/**
 * EmptyState Component for Coupons
 * 
 * Displays when no coupons are found.
 */
const EmptyState = ({ isRTL, t }) => {
  return (
    <div className="card">
      <div className={`text-center py-12 ${'text-right'}`}>
        <Tag size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('noCoupons') || 'No coupons found'}
        </h3>
        <p className="text-gray-500">
          {t('noCouponsDesc') || 'Get started by creating your first coupon'}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;


