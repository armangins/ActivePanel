import { format } from 'date-fns';

/**
 * CustomerDetailsAccount Component
 * 
 * Displays customer account information (username, email, member since).
 * 
 * @param {Object} customer - Customer object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomerDetailsAccount = ({ customer, isRTL, t }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
        {t('accountInfo') || 'Account Information'}
      </h3>
      <div className="space-y-4 text-sm">
        <div>
          <div className={`text-gray-600 mb-1 ${'text-right'}`}>
            {t('username') || 'Username'}:
          </div>
          <div className={`text-gray-900 font-medium ${'text-right'}`}>
            {customer.username || '-'}
          </div>
        </div>
        <div>
          <div className={`text-gray-600 mb-1 ${'text-right'}`}>
            {t('email') || 'Email'}:
          </div>
          <div className={`text-gray-900 font-medium ${'text-right'}`}>
            {customer.email || '-'}
          </div>
        </div>
        {customer.date_created && (
          <div>
            <div className={`text-gray-600 mb-1 ${'text-right'}`}>
              {t('memberSince') || 'Member Since'}:
            </div>
            <div className={`text-gray-900 font-medium ${'text-right'}`}>
              {format(new Date(customer.date_created), 'MMMM dd, yyyy')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsAccount;









