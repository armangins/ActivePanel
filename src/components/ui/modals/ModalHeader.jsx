/**
 * ModalHeader Component
 * 
 * Reusable modal header component.
 * 
 * @param {React.ReactNode} children - Header content
 * @param {string} className - Additional CSS classes
 */
const ModalHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default ModalHeader;






