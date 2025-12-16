import React from 'react';
import { FormProvider } from 'react-hook-form';
import { CalculatorOutlined as Calculator } from '@ant-design/icons';
import { Row, Col } from 'antd';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '12px 16px 24px', direction: vm.isRTL ? 'rtl' : 'ltr' }}>
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
        title={vm.isEditMode ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
      />

      <FormProvider {...vm.methods}>
        <form
          onSubmit={(e) => e.preventDefault()}
          noValidate
          autoComplete="off"
          style={{ width: '100%' }}
        >
          <Row gutter={[24, 24]}>
            {/* Left Panel - Product Details */}
            <Col xs={24} lg={12} xl={14}>
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
                scheduleDates={vm.scheduleDates}
                saving={vm.saving}
              />
            </Col>

            {/* Right Panel - Media, Attributes, Variations */}
            <Col xs={24} lg={12} xl={10}>
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
                onGenerateVariations={vm.handleGenerateVariations}

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
            </Col>
          </Row>
        </form>
      </FormProvider>

      {/* Success Modal */}
      <SuccessModal
        isOpen={vm.showSuccessModal}
        onClose={vm.handleSuccessModalClose}
        onCreateAnother={vm.handleCreateAnotherProduct}
        onGoToProducts={vm.handleGoToProducts}
        action={vm.isEditMode ? 'update' : 'create'}
        productName={vm.formData.product_name}
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
        onClose={() => vm.setShowCreateVariationModal(false)}
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
        onToggleAttribute={vm.toggleAttribute}
        isAttributeSelected={vm.isAttributeSelected}
        onSubmit={vm.handleCreateVariation}
      />
    </div>
  );
};

export default AddProductView;
