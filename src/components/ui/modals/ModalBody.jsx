/**
 * ModalBody Component
 * 
 * Reusable modal body component.
 * 
 * @param {React.ReactNode} children - Body content
 * @param {string} className - Additional CSS classes
 * @param {boolean} scrollable - Whether body should be scrollable (default: true)
 */
const ModalBody = ({ children, className = '', scrollable = true }) => {
  return (
    <div className={`px-6 py-4 ${scrollable ? 'max-h-[calc(100vh-200px)] overflow-y-auto' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default ModalBody;








