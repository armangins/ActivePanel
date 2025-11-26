import { Package } from 'lucide-react';

const EmptyState = ({ searchQuery, isRTL, t }) => {
  return (
    <div className="card text-center py-12">
      <Package className="mx-auto text-primary-300 mb-4" size={48} />
      <p className="text-gray-600 text-lg">{t('noProducts')}</p>
      <p className="text-gray-500 text-sm mt-2">
        {searchQuery ? t('trySearch') : t('getStarted')}
      </p>
    </div>
  );
};

export default EmptyState;

