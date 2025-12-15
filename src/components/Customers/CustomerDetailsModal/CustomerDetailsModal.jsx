import { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { customersAPI } from '../../../services/woocommerce';
import { useCustomer } from '../../../hooks/useCustomers';
import CustomerDetailsHeader from './CustomerDetailsHeader';
import CustomerDetailsAccount from './CustomerDetailsAccount';
import CustomerDetailsBilling from './CustomerDetailsBilling';
import CustomerDetailsShipping from './CustomerDetailsShipping';
import CustomerDetailsFooter from './CustomerDetailsFooter';
import CustomerDetailsLoading from './CustomerDetailsLoading';
import CustomerDetailsOrders from './CustomerDetailsOrders';

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
 * @param {Function} formatCurrency - Function to format currency
 */
const CustomerDetailsModal = ({ customer, onClose, isRTL, t, formatCurrency }) => {
  const [fullCustomer, setFullCustomer] = useState(customer);
  // Use useCustomer hook for data fetching with caching
  const { data: fullCustomerData, isLoading: loading } = useCustomer(customer?.id);

  useEffect(() => {
    if (fullCustomerData) {
      setFullCustomer(fullCustomerData);
    }
  }, [fullCustomerData]);

  if (!customer) return null;

  // Use fullCustomer if available, otherwise fall back to customer prop
  const displayCustomer = fullCustomer || customer;

  return (
    <Modal
      open={!!customer}
      onCancel={onClose}
      title={displayCustomer.first_name && displayCustomer.last_name 
        ? `${displayCustomer.first_name} ${displayCustomer.last_name}` 
        : displayCustomer.username || displayCustomer.email || t('customerDetails')}
      footer={<CustomerDetailsFooter onClose={onClose} isRTL={isRTL} t={t} />}
      width={800}
      style={{ top: 20 }}
      styles={{ body: { padding: 24, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      <Spin spinning={loading} tip={t('loading') || 'Loading...'}>
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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

            {/* Order History */}
            <CustomerDetailsOrders
              customer={displayCustomer}
              isRTL={isRTL}
              t={t}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default CustomerDetailsModal;


