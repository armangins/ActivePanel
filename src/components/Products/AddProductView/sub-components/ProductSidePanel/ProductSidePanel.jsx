import React from 'react';
import { SaveOutlined as Save, PlusOutlined as Plus } from '@ant-design/icons';
import { Space, Alert } from 'antd';
import { Button } from '../../../../ui';
import {
    ProductImagesSection,
    AttributesSection,
    VariationsSection,
    ScheduleModal
} from '../';
import CalculatorModal from '../../../CalculatorModal/CalculatorModal';

const ProductSidePanel = ({
    // Images
    images, uploadingImage, imageError, onImageUpload, onImageRemove,
    // Attributes
    productType, attributes, attributeTerms, selectedAttributeIds, selectedAttributeTerms,
    loadingAttributes, onToggleAttribute, onToggleTerm, isAttributeSelected, isTermSelected,
    // Variations
    variations, pendingVariations, loadingVariations, isEditMode, id,
    onAddVariationClick, onVariationClick, onDeletePendingVariation, onDeleteVariation,
    // Utils
    formatCurrency, isRTL, t, status,
    // Modals State
    showCalculatorModal, setShowCalculatorModal,
    showScheduleModal, setShowScheduleModal, scheduleDates, setScheduleDates,
    // Actions
    loadingProduct, saving, onSave, submitError,
    // Setters needed for modals
    setFormData,
    // Error Handling
    attributeErrors, onRetryLoadTerms
}) => {
    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Upload Images */}
            <ProductImagesSection
                images={images}
                uploading={uploadingImage}
                error={imageError}
                onUpload={onImageUpload}
                onRemove={onImageRemove}
                maxImages={12}
            />

            {/* Variations Section - Show directly under images when variations exist */}
            {productType === 'variable' && (variations.length > 0 || pendingVariations.length > 0) && (
                <VariationsSection
                    variations={variations}
                    pendingVariations={pendingVariations}
                    loading={loadingVariations}
                    isEditMode={isEditMode && !!id}
                    onAddClick={onAddVariationClick}
                    onVariationClick={onVariationClick}
                    onDeletePending={onDeletePendingVariation}
                    onDeleteVariation={onDeleteVariation}
                    formatCurrency={formatCurrency}
                    isRTL={isRTL}
                    t={t}
                />
            )}

            {/* Attributes Selection - Show after images/variations */}
            {productType === 'variable' && (
                <AttributesSection
                    attributes={attributes}
                    attributeTerms={attributeTerms}
                    selectedAttributeIds={selectedAttributeIds}
                    selectedAttributeTerms={selectedAttributeTerms}
                    loading={loadingAttributes}
                    onToggleAttribute={onToggleAttribute}
                    onToggleTerm={onToggleTerm}
                    isAttributeSelected={isAttributeSelected}
                    isTermSelected={isTermSelected}
                    attributeErrors={attributeErrors}
                    onRetryLoadTerms={onRetryLoadTerms}
                    onAddVariationClick={onAddVariationClick}
                    t={t}
                />
            )}

            {/* Calculator Modal */}
            {showCalculatorModal && (
                <CalculatorModal
                    onClose={() => setShowCalculatorModal(false)}
                    onSetPrice={(price) => {
                        setFormData(prev => ({ ...prev, regular_price: price.toString() }));
                        setShowCalculatorModal(false);
                    }}
                />
            )}

            {/* Schedule Modal */}
            <ScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                scheduleDates={scheduleDates}
                onDatesChange={setScheduleDates}
                onSave={() => {
                    setFormData(prev => ({
                        ...prev,
                        date_on_sale_from: scheduleDates.start || '',
                        date_on_sale_to: scheduleDates.end || ''
                    }));
                    setShowScheduleModal(false);
                }}
            />

            {/* Loading State */}
            {loadingProduct && (
                <Alert
                    message={t('loading') || 'טוען...'}
                    type="info"
                    showIcon
                    style={{ textAlign: 'right' }}
                />
            )}

            {/* Action Buttons */}
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Button
                    variant="primary"
                    onClick={() => onSave('publish')}
                    disabled={saving || loadingProduct}
                    isLoading={saving}
                    style={{ width: '100%' }}
                    icon={isEditMode && status === 'publish' ? Save : Plus}
                >
                    {isEditMode && status === 'publish' ? (t('updateProduct') || 'עדכן מוצר') : (t('publishProduct') || 'פרסם')}
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => onSave('draft')}
                    disabled={saving || loadingProduct}
                    style={{ width: '100%' }}
                >
                    {status === 'publish' ? (t('switchToDraft') || 'העבר לטיוטה') : (t('saveDraft') || 'שמור טיוטה')}
                </Button>
            </Space>

            {submitError && (
                <Alert
                    message={submitError}
                    type="error"
                    showIcon
                    style={{ textAlign: 'right', whiteSpace: 'pre-line' }}
                />
            )}
        </Space>
    );
};

export default ProductSidePanel;
