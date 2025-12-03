/**
 * TableHeader Component
 * 
 * Reusable table header component.
 * 
 * @param {React.ReactNode} children - Header row content
 * @param {string} className - Additional CSS classes
 */
const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
};

export default TableHeader;






