/**
 * ProductDetailsAttributes Component
 * 
 * Displays product attributes with their values.
 * 
 * @param {Array} attributes - Array of attribute objects
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsAttributes = ({ attributes, isRTL, t }) => {
  return (
    <div>
      <p className={`font-medium text-gray-700 ${'text-right'}`}>
        {t('attributes')}
      </p>
      <div className="space-y-2 mt-2">
        {attributes.map((attr) => (
          <div key={attr.id || attr.name}>
            <p className={`text-sm font-semibold text-gray-800 ${'text-right'}`}>
              {attr.name}
            </p>
            <p className={`text-sm text-gray-700 ${'text-right'}`}>
              {(attr.options || []).join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailsAttributes;














