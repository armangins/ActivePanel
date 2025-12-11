/**
 * Card Component
 * 
 * Reusable card container component.
 * 
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {Function} onClick - Optional click handler
 * @param {boolean} hover - Whether to show hover effect
 */
const Card = ({ children, className = '', onClick, hover = false }) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const hoverClasses = hover || onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;








