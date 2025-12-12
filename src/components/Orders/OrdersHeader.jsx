/**
 * OrdersHeader Component
 * 
 * Header section for the Orders page displaying title and order count.
 * 
 * @param {Number} displayedCount - Number of orders currently displayed
 * @param {Number} totalCount - Total number of orders
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrdersHeader = ({ displayedCount, totalCount, isRTL, t }) => {
  return (
    <div className={`${'text-right'}`}>
      <h1 className="text-3xl font-bold text-gray-900">{t('orders')}</h1>
      <p className="text-gray-600 mt-1">
        {t('showing')} {displayedCount} {t('of')} {totalCount} {t('orders').toLowerCase()}
      </p>
    </div>
  );
};

export default OrdersHeader;










