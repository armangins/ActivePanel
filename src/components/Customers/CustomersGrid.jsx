import CustomerCard from './CustomerCard';

/**
 * CustomersGrid Component
 * 
 * Grid layout displaying customer cards in a responsive grid.
 * 
 * @param {Array} customers - Array of customer objects
 * @param {Function} onCustomerClick - Callback when a customer card is clicked
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomersGrid = ({ customers, onCustomerClick, isRTL, t, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onClick={() => onCustomerClick(customer)}
          isRTL={isRTL}
          t={t}
          formatCurrency={formatCurrency}
        />
      ))}
    </div>
  );
};

export default CustomersGrid;










