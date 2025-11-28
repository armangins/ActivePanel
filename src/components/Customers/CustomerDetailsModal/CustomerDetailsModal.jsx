import { useState, useEffect } from 'react';
import { customersAPI } from '../../../services/woocommerce';
import CustomerDetailsHeader from './CustomerDetailsHeader';
import CustomerDetailsAccount from './CustomerDetailsAccount';
import CustomerDetailsBilling from './CustomerDetailsBilling';
import CustomerDetailsShipping from './CustomerDetailsShipping';
import CustomerDetailsFooter from './CustomerDetailsFooter';
import CustomerDetailsLoading from './CustomerDetailsLoading';

/**
 * CustomerDetailsModal Component
 * 
 * Main modal component for displaying customer details.
 * Loads full customer details when opened.
 * 
 * @param {Object} customer - Customer object to display (may be partial from list)
 * @param {Function} onClose - Callback to close the modal
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomerDetailsModal = ({ customer, onClose, isRTL, t }) => {
  const [fullCustomer, setFullCustomer] = useState(customer);
  const [loading, setLoading] = useState(false);

  // Load full customer details when modal opens
  useEffect(() => {
    const loadFullCustomer = async () => {
      if (!customer?.id) return;
      
      try {
        setLoading(true);
        const fullCustomerData = await customersAPI.getById(customer.id);
        setFullCustomer(fullCustomerData);
      } catch (error) {
        // Failed to load full customer details
        // Fall back to the customer passed as prop
      } finally {
        setLoading(false);
      }
    };

    loadFullCustomer();
  }, [customer?.id]);

  if (!customer) return null;

  // Use fullCustomer if available, otherwise fall back to customer prop
  const displayCustomer = fullCustomer || customer;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <CustomerDetailsHeader
          customer={displayCustomer}
          onClose={onClose}
          isRTL={isRTL}
          t={t}
        />

        {/* Content */}
        <div className="p-6 space-y-6 bg-gray-50">
          {loading ? (
            <CustomerDetailsLoading />
          ) : (
            <>
              {/* Account Information */}
              <CustomerDetailsAccount
                customer={displayCustomer}
                isRTL={isRTL}
                t={t}
              />

              {/* Billing Address */}
              <CustomerDetailsBilling
                billing={displayCustomer.billing}
                isRTL={isRTL}
                t={t}
              />

              {/* Shipping Address */}
              <CustomerDetailsShipping
                shipping={displayCustomer.shipping}
                isRTL={isRTL}
                t={t}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <CustomerDetailsFooter
          onClose={onClose}
          isRTL={isRTL}
          t={t}
        />
      </div>
    </div>
  );
};

export default CustomerDetailsModal;


