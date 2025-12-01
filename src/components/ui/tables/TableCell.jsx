/**
 * TableCell Component
 * 
 * Reusable table cell component.
 * 
 * @param {React.ReactNode} children - Cell content
 * @param {string} className - Additional CSS classes
 * @param {boolean} isHeader - Whether this is a header cell (th vs td)
 * @param {boolean} isRTL - Whether layout is right-to-left
 */
const TableCell = ({ children, className = '', isHeader = false, isRTL = true }) => {
  const baseClasses = 'px-6 py-4 whitespace-nowrap text-sm';
  const textAlignClasses = isRTL ? 'text-right' : 'text-left';
  const Tag = isHeader ? 'th' : 'td';
  
  return (
    <Tag className={`${baseClasses} ${textAlignClasses} ${className}`}>
      {children}
    </Tag>
  );
};

export default TableCell;

