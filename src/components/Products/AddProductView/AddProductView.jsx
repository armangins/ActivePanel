import React from 'react';
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
import { generateSKU } from '../../../services/gemini';

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
        {/* Left Panel - Product Details */}
        <ProductDetailsPanel
          formData={vm.formData}
          errors={vm.errors}
          onFormDataChange={vm.setFormData}
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
          imageError={vm.errors.images}
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
          // Variations
          variations={vm.variations}
          pendingVariations={vm.pendingVariations}
          loadingVariations={vm.loadingVariations}
          isEditMode={vm.isEditMode}
          id={vm.id}
          onAddVariationClick={() => {
            vm.setVariationFormData(prev => ({
              ...prev,
              regular_price: vm.formData.regular_price || '',
              sale_price: vm.formData.sale_price || '',
            }));
            vm.setShowCreateVariationModal(true);
          }}
          onVariationClick={vm.handleEditVariation}
          onDeletePendingVariation={vm.handleDeletePendingVariation}
          // Utils
          formatCurrency={vm.formatCurrency}
          isRTL={vm.isRTL}
          t={vm.t}
          // Modals
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
          submitError={vm.errors.submit}
          setFormData={vm.setFormData}
        />
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={vm.showSuccessModal}
        onClose={() => {
          vm.setShowSuccessModal(false);
          vm.navigate('/products');
        }}
        isEditMode={vm.isEditMode}
        onConfirm={() => {
          vm.setShowSuccessModal(false);
          vm.navigate('/products');
        }}
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
        onGenerateSKU={async () => {
          try {
            vm.setGeneratingSKU(true);
            const sku = await generateSKU(vm.formData.name || '');
            vm.setVariationFormData(prev => ({ ...prev, sku }));
          } catch (error) {
            // Failed to generate SKU
          } finally {
            vm.setGeneratingSKU(false);
          }
        }}
        parentProductName={vm.formData.name}
        onSubmit={vm.handleUpdateVariation}
      />

      {/* Create Variation Modal */}
      <CreateVariationModal
        isOpen={vm.showCreateVariationModal}
        onClose={() => vm.setShowCreateVariationModal(false)}
        formData={vm.variationFormData}
        onFormDataChange={vm.setVariationFormData}
        selectedAttributeIds={vm.selectedAttributeIds}
        attributes={vm.attributes}
        attributeTerms={vm.attributeTerms}
        creating={vm.creatingVariation}
        generatingSKU={vm.generatingSKU}
        onGenerateSKU={async () => {
          try {
            vm.setGeneratingSKU(true);
            const sku = await generateSKU(vm.formData.name || '');
            vm.setVariationFormData(prev => ({ ...prev, sku }));
          } catch (error) {
            // Failed to generate SKU
          } finally {
            vm.setGeneratingSKU(false);
          }
        }}
        parentProductName={vm.formData.name}
        onSubmit={vm.handleCreateVariation}
      />
    </div>
  );
};

export default AddProductView;
