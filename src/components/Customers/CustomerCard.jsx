import { Mail, Phone, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';

/**
 * CustomerCard Component
 * 
 * Individual customer card displaying customer information.
 * 
 * @param {Object} customer - Customer object
 * @param {Function} onClick - Callback when card is clicked
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomerCard = ({ customer, onClick, isRTL, t }) => {
  return (
    <div
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      dir="rtl"
    >
      <div className={`flex items-start gap-4 ${'flex-row-reverse'}`}>
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-primary-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold text-gray-900 truncate ${'text-right'}`}>
            {customer.first_name} {customer.last_name}
          </h3>
          <p className={`text-sm text-gray-500 truncate ${'text-right'}`}>
            {customer.username}
          </p>
        </div>
      </div>

      <div className={`mt-4 space-y-2 ${'text-right'}`}>
        {customer.email && (
          <div className={`flex items-center text-sm text-gray-600 ${'flex-row-reverse'}`}>
            <Mail size={16} className={`${'ml-2'} text-gray-400 flex-shrink-0`} />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.billing?.phone && (
          <div className={`flex items-center text-sm text-gray-600 ${'flex-row-reverse'}`}>
            <Phone size={16} className={`${'ml-2'} text-gray-400 flex-shrink-0`} />
            <span>{customer.billing.phone}</span>
          </div>
        )}
        {customer.billing?.city && (
          <div className={`flex items-center text-sm text-gray-600 ${'flex-row-reverse'}`}>
            <MapPin size={16} className={`${'ml-2'} text-gray-400 flex-shrink-0`} />
            <span className="truncate">
              {customer.billing.city}, {customer.billing.country}
            </span>
          </div>
        )}
      </div>

      {customer.date_created && (
        <div className={`mt-4 pt-4 border-t border-gray-200 ${'text-right'}`}>
          <p className="text-xs text-gray-500">
            {t('memberSince')} {format(new Date(customer.date_created), 'MMM yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerCard;


