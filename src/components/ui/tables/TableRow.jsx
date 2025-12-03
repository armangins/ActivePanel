/**
 * TableRow Component
 * 
 * Reusable table row component.
 * 
 * @param {React.ReactNode} children - Row cell content
 * @param {string} className - Additional CSS classes
 * @param {Function} onClick - Optional click handler
 * @param {boolean} hover - Whether to show hover effect
 */
const TableRow = ({ children, className = '', onClick, hover = false }) => {
  const hoverClasses = hover || onClick ? 'hover:bg-gray-50 cursor-pointer' : '';
  
  return (
    <tr 
      className={`${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export default TableRow;






