/**
 * Table Component
 * 
 * Reusable table container component.
 * 
 * @param {React.ReactNode} children - Table content
 * @param {string} className - Additional CSS classes
 */
const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
};

export default Table;




