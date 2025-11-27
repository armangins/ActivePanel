/**
 * CustomerDetailsFooter Component
 * 
 * Footer section of the customer details modal with close button.
 * 
 * @param {Function} onClose - Callback to close the modal
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomerDetailsFooter = ({ onClose, isRTL, t }) => {
  return (
    <div className="p-6 border-t border-gray-200 flex justify-start">
      <button onClick={onClose} className="btn-primary">
        {t('close')}
      </button>
    </div>
  );
};

export default CustomerDetailsFooter;

