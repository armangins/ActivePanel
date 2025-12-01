/**
 * ModalFooter Component
 * 
 * Reusable modal footer component.
 * 
 * @param {React.ReactNode} children - Footer content
 * @param {string} className - Additional CSS classes
 * @param {boolean} isRTL - Whether layout is right-to-left
 */
const ModalFooter = ({ children, className = '', isRTL = true }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 flex ${isRTL ? 'flex-row-reverse' : ''} justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};

export default ModalFooter;




