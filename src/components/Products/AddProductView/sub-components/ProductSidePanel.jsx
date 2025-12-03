import React from 'react';
import { DocumentArrowDownIcon as Save, PlusIcon as Plus } from '@heroicons/react/24/outline';
import { Button } from '../../../ui';
import {
    ProductImagesSection,
    AttributesSection,
    VariationsSection,
    ScheduleModal
} from './';
import CalculatorModal from '../../CalculatorModal'; // Check import path

const ProductSidePanel = ({
    // Images
    images, uploadingImage, imageError, onImageUpload, onImageRemove,
    // Attributes
    productType, attributes, attributeTerms, selectedAttributeIds, selectedAttributeTerms,
    loadingAttributes, onToggleAttribute, onToggleTerm, isAttributeSelected, isTermSelected,
    // Variations
    variations, pendingVariations, loadingVariations, isEditMode, id,
    onAddVariationClick, onVariationClick, onDeletePendingVariation,
    // Utils
    formatCurrency, isRTL, t,
    // Modals State
    showCalculatorModal, setShowCalculatorModal,
    showScheduleModal, setShowScheduleModal, scheduleDates, setScheduleDates,
    // Actions
    loadingProduct, saving, onSave, submitError,
    // Setters needed for modals
    setFormData
}) => {
    return (
        <div className="space-y-6">
            {/* Upload Images */}
            <ProductImagesSection
                images={images}
                uploading={uploadingImage}
                error={imageError}
                onUpload={onImageUpload}
                onRemove={onImageRemove}
                maxImages={12}
            />

            {/* Attributes Selection */}
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
                />
            )}

            {/* Variations Section */}
            {productType === 'variable' && (
                <VariationsSection
                    variations={variations}
                    pendingVariations={pendingVariations}
                    loading={loadingVariations}
                    isEditMode={isEditMode && !!id}
                    onAddClick={onAddVariationClick}
                    onVariationClick={onVariationClick}
                    onDeletePending={onDeletePendingVariation}
                    formatCurrency={formatCurrency}
                    isRTL={isRTL}
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
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm text-right">{t('loading') || 'טוען...'}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
                <Button
                    variant="primary"
                    onClick={() => onSave('publish')}
                    disabled={saving || loadingProduct}
                    isLoading={saving}
                    className="w-full"
                    icon={isEditMode ? Save : Plus}
                >
                    {isEditMode ? t('updateProduct') : t('addProduct')}
                </Button>
            </div>

            {submitError && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 text-sm text-right">{submitError}</p>
                </div>
            )}
        </div>
    );
};

export default ProductSidePanel;
