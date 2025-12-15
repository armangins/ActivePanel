/**
 * ProductDetailsCategories Component
 * 
 * Displays product categories as badge chips.
 * 
 * @param {Array} categories - Array of category objects
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsCategories = ({ categories, isRTL, t }) => {
  return (
    <div>
      <p className={`font-medium text-gray-700 ${'text-right'}`}>
        {t('categories')}
      </p>
      <div className={`flex flex-wrap gap-2 mt-1 ${'justify-start'}`}>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs"
          >
            {cat.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailsCategories;














