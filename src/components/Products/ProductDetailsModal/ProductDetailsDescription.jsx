/**
 * ProductDetailsDescription Component
 * 
 * Displays product description (short or full) with HTML content support.
 * 
 * @param {String} title - Section title
 * @param {String} content - HTML content to display
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 */
const ProductDetailsDescription = ({ title, content, isRTL }) => {
  return (
    <div>
      <p className={`font-medium text-gray-700 ${'text-right'}`}>
        {title}
      </p>
      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
        dir="rtl"
      />
    </div>
  );
};

export default ProductDetailsDescription;


