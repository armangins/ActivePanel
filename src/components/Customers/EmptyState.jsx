import { User } from 'lucide-react';

/**
 * EmptyState Component
 * 
 * Displays empty state message when no customers are found.
 * 
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const EmptyState = ({ isRTL, t }) => {
  return (
    <div className="card text-center py-12">
      <User className="mx-auto text-primary-300 mb-4" size={48} />
      <p className="text-gray-600 text-lg">{t('noCustomers')}</p>
    </div>
  );
};

export default EmptyState;


