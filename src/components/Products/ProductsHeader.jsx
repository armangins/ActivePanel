import { Plus } from 'lucide-react';

const ProductsHeader = ({ displayedCount, totalCount, onCreateProduct, isRTL, t }) => {
  return (
    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('products')}</h1>
        <p className="text-gray-600 mt-1">
          {t('showing')} {displayedCount} {t('of')} {totalCount} {t('products').toLowerCase()}
        </p>
      </div>
      <button
        onClick={onCreateProduct}
        className={`btn-primary flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-x-2`}
      >
        <Plus size={20} />
        <span>{t('createProduct')}</span>
      </button>
    </div>
  );
};

export default ProductsHeader;

