import DOMPurify from 'dompurify';

/**
 * ProductDetailsDescription Component
 * 
 * Displays product description (short or full) with HTML content support.
 * Uses DOMPurify to sanitize HTML and prevent XSS attacks.
 * 
 * @param {String} title - Section title
 * @param {String} content - HTML content to display
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 */
const ProductDetailsDescription = ({ title, content, isRTL }) => {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

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


