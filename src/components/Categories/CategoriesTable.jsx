import { PencilIcon as Edit, TrashIcon as Trash, Squares2X2Icon as BulkAssign, EyeIcon as View } from '@heroicons/react/24/outline';

const CategoriesTable = ({ categories, onEdit, onDelete, onBulkAssign, isRTL, t }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={`px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('name') || 'Name'}
              </th>
              <th className={`px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('slug') || 'Slug'}
              </th>
              <th className={`px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('description') || 'Description'}
              </th>
              <th className={`px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('count') || 'Products'}
              </th>
              <th className={`px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {category.name}
                </td>
                <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {category.slug}
                </td>
                <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div 
                    className="line-clamp-2 max-w-xs sm:max-w-md"
                    dangerouslySetInnerHTML={{ __html: category.description || '-' }}
                  />
                </td>
                <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {category.count || 0}
                </td>
                <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="grid grid-cols-4 gap-2 w-fit">
                    <button
                      onClick={() => onBulkAssign(category)}
                      className="w-10 h-10 flex items-center justify-center text-primary-500 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200"
                      title={t('bulkAssign') || 'הקצאה מרובת מוצרים'}
                    >
                      <BulkAssign className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onEdit(category)}
                      className="w-10 h-10 flex items-center justify-center text-primary-500 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200"
                      title={t('edit') || 'ערוך'}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(category.id)}
                      className="w-10 h-10 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200"
                      title={t('delete') || 'מחק'}
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 opacity-50 cursor-not-allowed"
                      title={t('comingSoon') || 'בקרוב...'}
                      disabled
                    >
                      <View className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesTable;
