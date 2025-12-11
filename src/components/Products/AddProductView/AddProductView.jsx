import React from 'react';
import { FormProvider } from 'react-hook-form';
import { CalculatorIcon as Calculator } from '@heroicons/react/24/outline';
import { Breadcrumbs, Button } from '../../ui';
import {
  PageTitle,
  ProductDetailsPanel,
  ProductSidePanel,
  SuccessModal,
  EditVariationModal,
  CreateVariationModal
} from './sub-components';
import { useAddProductViewModel } from './hooks';

const AddProductView = () => {
  const vm = useAddProductViewModel();

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6" dir={vm.isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          vm.t('dashboard'),
          vm.t('ecommerce') || 'Ecommerce',
          vm.isEditMode ? vm.t('editProduct') : vm.t('addProduct')
        ]}
      />

      {/* Title and Navigation */}
      <PageTitle
        title={vm.isEditMode ? vm.t('editProduct') : vm.t('addProduct')}
        actions={
          <Button
            variant="ghost"
            onClick={() => vm.navigate('/calculator')}
            className="flex items-center gap-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            icon={Calculator}
          >
            {vm.t('calculator') || 'מחשבון'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <FormProvider {...vm.methods}>
          <form
            className="col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            onSubmit={(e) => e.preventDefault()}
            noValidate
            autoComplete="off"
          >


            {/* Left Panel - Product Details */}
            <ProductDetailsPanel
              // passing simplified props
              productType={vm.productType}
              onProductTypeChange={vm.handleProductTypeChange}
              categories={vm.categories}
              selectedDiscount={vm.selectedDiscount}
              onDiscountSelect={vm.handleDiscountSelect}
              onDiscountClear={vm.handleDiscountClear}
              generatingSKU={vm.generatingSKU}
              onGenerateSKU={vm.handleGenerateSKU}
              improvingShortDescription={vm.improvingShortDescription}
              onImproveShortDescription={vm.handleImproveShortDescription}
              improvingDescription={vm.improvingDescription}
              onImproveDescription={vm.handleImproveDescription}
              onCalculatorClick={() => vm.setShowCalculatorModal(true)}
              onScheduleClick={() => {
                vm.setScheduleDates({
                  start: vm.formData.date_on_sale_from || '',
                  end: vm.formData.date_on_sale_to || ''
                });
                vm.setShowScheduleModal(true);
              }}
              saving={vm.saving}
            />

            {/* Right Panel - Media, Attributes, Variations */}
            <ProductSidePanel
              // Images
              images={vm.formData.images}
              uploadingImage={vm.uploadingImage}
              imageError={vm.errors.images?.message}
              onImageUpload={vm.handleImageUpload}
              onImageRemove={vm.removeImage}

              // Attributes
              productType={vm.productType}
              attributes={vm.attributes}
              attributeTerms={vm.attributeTerms}
              selectedAttributeIds={vm.selectedAttributeIds}
              selectedAttributeTerms={vm.selectedAttributeTerms}
              loadingAttributes={vm.loadingAttributes}
              onToggleAttribute={vm.toggleAttribute}
              onToggleTerm={vm.toggleAttributeTerm}
              isAttributeSelected={vm.isAttributeSelected}
              isTermSelected={vm.isTermSelected}
              attributeErrors={vm.attributeErrors}
              onRetryLoadTerms={(attributeId) => {
                // Force reload by clearing error and recalling load
                vm.loadAttributeTerms(attributeId);
              }}

              // Variations
              variations={vm.variations}
              pendingVariations={vm.pendingVariations}
              loadingVariations={vm.loadingVariations}
              isEditMode={vm.isEditMode}
              id={vm.id}
              onAddVariationClick={() => {
                // We need to update variation form data directly since it's separate state
                vm.setVariationFormData(prev => ({
                  ...prev,
                  regular_price: vm.formData.regular_price || '',
                  sale_price: vm.formData.sale_price || '',
                  sku: vm.formData.sku || '',
                  stock_quantity: vm.formData.stock_quantity || '',
                  attributes: vm.selectedAttributeIds.reduce((acc, attrId) => {
                    const selectedTerms = vm.selectedAttributeTerms[attrId];
                    // If terms are selected, pre-fill with the first one
                    // This matches user expectation: "once i choose the att... modal should be with the attr that i choose"
                    if (selectedTerms && selectedTerms.length > 0) {
                      acc[attrId] = selectedTerms[0];
                    }
                    return acc;
                  }, {})
                }));
                vm.setShowCreateVariationModal(true);
              }}
              onVariationClick={vm.handleEditVariation}
              onDeletePendingVariation={vm.handleDeletePendingVariation}
              onDeleteVariation={vm.handleDeleteVariation}

              // Utils
              formatCurrency={vm.formatCurrency}
              isRTL={vm.isRTL}
              t={vm.t}
              status={vm.formData.status}

              // Modals State
              showCalculatorModal={vm.showCalculatorModal}
              setShowCalculatorModal={vm.setShowCalculatorModal}
              showScheduleModal={vm.showScheduleModal}
              setShowScheduleModal={vm.setShowScheduleModal}
              scheduleDates={vm.scheduleDates}
              setScheduleDates={vm.setScheduleDates}

              // Actions
              loadingProduct={vm.loadingProduct}
              saving={vm.saving}
              onSave={vm.handleSave}
              submitError={vm.errors.root?.message}
              setFormData={vm.setFormData}
            />
          </form>
        </FormProvider>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={vm.showSuccessModal}
        onClose={vm.handleSuccessModalClose}
        onCreateAnother={vm.handleCreateAnotherProduct}
        onGoToProducts={vm.handleGoToProducts}
        action={vm.isEditMode ? 'update' : 'create'}
      />

      {/* Edit Variation Modal */}
      <EditVariationModal
        isOpen={vm.showEditVariationModal}
        onClose={() => vm.setShowEditVariationModal(false)}
        formData={vm.variationFormData}
        onFormDataChange={vm.setVariationFormData}
        selectedAttributeIds={vm.selectedAttributeIds}
        attributes={vm.attributes}
        attributeTerms={vm.attributeTerms}
        updating={vm.creatingVariation}
        generatingSKU={vm.generatingSKU}
        onGenerateSKU={vm.handleGenerateVariationSKU}
        parentProductName={vm.formData.product_name}
        parentSku={vm.formData.sku || ''}
        existingVariationSkus={[
          ...vm.variations
            .filter(v => v.id !== vm.editingVariationId)
            .map(v => v.sku)
            .filter(Boolean),
          ...vm.pendingVariations
            .filter(v => v.id !== vm.editingVariationId)
            .map(v => v.sku)
            .filter(Boolean)
        ]}
        currentVariationId={vm.editingVariationId}
        onSubmit={vm.handleUpdateVariation}
      />

      {/* Create Variation Modal */}
      <CreateVariationModal
        isOpen={vm.showCreateVariationModal}
        onClose={() => vm.setShowEditVariationModal(false)}
        formData={vm.variationFormData}
        onFormDataChange={vm.setVariationFormData}
        selectedAttributeIds={vm.selectedAttributeIds}
        attributes={vm.attributes}
        attributeTerms={vm.attributeTerms}
        creating={vm.creatingVariation}
        generatingSKU={vm.generatingSKU}
        onGenerateSKU={vm.handleGenerateVariationSKU}
        parentProductName={vm.formData.product_name}
        parentSku={vm.formData.sku || ''}
        existingVariationSkus={[
          ...vm.variations.map(v => v.sku).filter(Boolean),
          ...vm.pendingVariations.map(v => v.sku).filter(Boolean)
        ]}
        onSubmit={vm.handleCreateVariation}
      />
    </div>
  );
};

export default AddProductView;
