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
  const gridId = `customers-grid-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <>
      <style>{`
        #${gridId} {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
          width: 100%;
        }
        
        @media (min-width: 768px) {
          #${gridId} {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          #${gridId} {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
      <div id={gridId}>
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
    </>
  );
};

export default CustomersGrid;














