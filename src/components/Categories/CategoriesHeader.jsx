import { PlusIcon as Plus } from '@heroicons/react/24/outline';
import { SearchInput } from '../ui/inputs';

const CategoriesHeader = ({ searchQuery, onSearchChange, onAddClick, displayedCount, totalCount, isRTL, t }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex-1 w-full sm:w-auto">
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchCategories') || 'Search categories...'}
          isRTL={isRTL}
        />
      </div>
      
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
          {displayedCount} {displayedCount === 1 ? (t('category') || 'category') : (t('categories') || 'categories')}
          {searchQuery && ` / ${totalCount} ${t('total') || 'total'}`}
        </div>
        
        <button
          onClick={onAddClick}
          className={`btn-primary flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}
        >
          <Plus className="w-5 h-5" />
          <span>{t('addCategory') || 'Add Category'}</span>
        </button>
      </div>
    </div>
  );
};

export default CategoriesHeader;




