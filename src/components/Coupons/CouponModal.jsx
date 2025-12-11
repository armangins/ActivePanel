import { useLanguage } from '../../contexts/LanguageContext';
import useCouponModal from './CouponModal/useCouponModal';
import GeneralSettingsStep from './CouponModal/GeneralSettingsStep';
import UsageRestrictionsStep from './CouponModal/UsageRestrictionsStep';
import UsageLimitsStep from './CouponModal/UsageLimitsStep';
import CouponModalHeader from './CouponModal/CouponModalHeader';
import CouponModalFooter from './CouponModal/CouponModalFooter';

/**
 * CouponModal Component
 * 
 * Optimized modal for creating and editing coupons with step-by-step wizard.
 * 
 * @param {Object} coupon - Coupon object to edit (null for new coupon)
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onSave - Callback when coupon is saved
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CouponModal = ({ coupon, onClose, onSave, formatCurrency, isRTL, t }) => {
  const {
    currentStep,
    steps,
    formData,
    setFormData,
    validationErrors,
    filteredProducts,
    filteredExcludeProducts,
    filteredCategories,
    productSearch,
    setProductSearch,
    excludeProductSearch,
    setExcludeProductSearch,
    categorySearch,
    setCategorySearch,
    emailInput,
    setEmailInput,
    saving,
    handleNext,
    handlePrevious,
    handleSubmit,
    addEmailRestriction,
    removeEmailRestriction,
    toggleProductId,
    toggleCategoryId,
    showProductDropdown,
    setShowProductDropdown,
    showExcludeProductDropdown,
    setShowExcludeProductDropdown,
    tempSelectedProducts,
    tempSelectedExcludeProducts,
    toggleTempProductSelection,
    addSelectedProducts,
    removeProductId,
    allProducts,
  } = useCouponModal(coupon, onClose, onSave, t);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GeneralSettingsStep
            formData={formData}
            setFormData={setFormData}
            validationErrors={validationErrors}
            t={t}
          />
        );

      case 1:
        return (
          <UsageRestrictionsStep
            formData={formData}
            setFormData={setFormData}
            filteredProducts={filteredProducts}
            filteredExcludeProducts={filteredExcludeProducts}
            filteredCategories={filteredCategories}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            excludeProductSearch={excludeProductSearch}
            setExcludeProductSearch={setExcludeProductSearch}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            emailInput={emailInput}
            setEmailInput={setEmailInput}
            addEmailRestriction={addEmailRestriction}
            removeEmailRestriction={removeEmailRestriction}
            toggleProductId={toggleProductId}
            toggleCategoryId={toggleCategoryId}
            isRTL={isRTL}
            t={t}
            validationErrors={validationErrors}
            showProductDropdown={showProductDropdown}
            setShowProductDropdown={setShowProductDropdown}
            showExcludeProductDropdown={showExcludeProductDropdown}
            setShowExcludeProductDropdown={setShowExcludeProductDropdown}
            tempSelectedProducts={tempSelectedProducts}
            tempSelectedExcludeProducts={tempSelectedExcludeProducts}
            toggleTempProductSelection={toggleTempProductSelection}
            addSelectedProducts={addSelectedProducts}
            removeProductId={removeProductId}
            allProducts={allProducts}
          />
        );

      case 2:
        return (
          <UsageLimitsStep
            formData={formData}
            setFormData={setFormData}
            validationErrors={validationErrors}
            t={t}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white sm:rounded-lg max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <CouponModalHeader
          coupon={coupon}
          currentStep={currentStep}
          steps={steps}
          onClose={onClose}
          t={t}
        />

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6" style={{ overflowX: 'visible' }}>
          {renderStepContent()}
        </form>

        <CouponModalFooter
          currentStep={currentStep}
          steps={steps}
          onClose={onClose}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          saving={saving}
          coupon={coupon}
          t={t}
          validationErrors={validationErrors}
        />
      </div>
    </div>
  );
};

export default CouponModal;
