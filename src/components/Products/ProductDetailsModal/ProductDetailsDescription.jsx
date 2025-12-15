import { sanitizeHTML } from '../../../utils/security';

/**
 * ProductDetailsDescription Component
 * 
 * Displays product description (short or full) with HTML content support.
 * Uses centralized security utility to sanitize HTML and prevent XSS attacks.
 * 
 * @param {String} title - Section title
 * @param {String} content - HTML content to display
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 */
const ProductDetailsDescription = ({ title, content, isRTL }) => {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHTML(content || '');

  return (
    <div>
      <p className={`font-medium text-gray-700 ${'text-right'}`}>
        {title}
      </p>
      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        dir="rtl"
      />
    </div>
  );
};

export default ProductDetailsDescription;


