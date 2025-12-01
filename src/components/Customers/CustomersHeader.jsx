/**
 * CustomersHeader Component
 * 
 * Header section for the Customers page displaying title and customer count.
 * 
 * @param {Number} displayedCount - Number of customers currently displayed
 * @param {Number} totalCount - Total number of customers
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomersHeader = ({ displayedCount, totalCount, isRTL, t }) => {
  return (
    <div className={`${'text-right'}`}>
      <h1 className="text-3xl font-bold text-gray-900">{t('customers')}</h1>
      <p className="text-gray-600 mt-1">
        {t('showing')} {displayedCount} {t('of')} {totalCount} {t('customers').toLowerCase()}
      </p>
    </div>
  );
};

export default CustomersHeader;





