import React, { memo, useCallback } from 'react';
import { SaveOutlined as Save, PlusOutlined as Plus } from '@ant-design/icons';
import { Space, Alert } from 'antd';
import { Button } from '../../../../ui';
import {
    ProductImagesSection,
    VariationsSection,
    ScheduleModal
} from '../';
import CalculatorModal from '../../../CalculatorModal/CalculatorModal';

const ProductSidePanel = ({
    // Images
    images, uploadingImage, imageError, onImageUpload, onImageRemove,
    // Product Type
    productType,
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
}) => {

    const handleCalculatorClose = useCallback(() => setShowCalculatorModal(false), [setShowCalculatorModal]);

    const handleSetPrice = useCallback((price) => {
        setFormData(prev => ({ ...prev, regular_price: price.toString() }));
        setShowCalculatorModal(false);
    }, [setFormData, setShowCalculatorModal]);

    const handleScheduleClose = useCallback(() => setShowScheduleModal(false), [setShowScheduleModal]);

    const handleScheduleSave = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            date_on_sale_from: scheduleDates.start || '',
            date_on_sale_to: scheduleDates.end || ''
        }));
        setShowScheduleModal(false);
    }, [setFormData, scheduleDates, setShowScheduleModal]);

    const handleSavePublish = useCallback(() => onSave('publish'), [onSave]);
    const handleSaveDraft = useCallback(() => onSave('draft'), [onSave]);

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

            {/* Variations Section - Show when product is variable */}
            {productType === 'variable' && (
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

            {/* Calculator Modal */}
            <CalculatorModal
                isOpen={showCalculatorModal}
                onClose={handleCalculatorClose}
                onSetPrice={handleSetPrice}
            />

            {/* Schedule Modal */}
            <ScheduleModal
                isOpen={showScheduleModal}
                onClose={handleScheduleClose}
                scheduleDates={scheduleDates}
                onDatesChange={setScheduleDates}
                onSave={handleScheduleSave}
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
                    onClick={handleSavePublish}
                    disabled={saving || loadingProduct}
                    isLoading={saving}
                    style={{ width: '100%' }}
                    icon={isEditMode && status === 'publish' ? Save : Plus}
                >
                    {isEditMode && status === 'publish' ? (t('updateProduct') || 'עדכן מוצר') : (t('publishProduct') || 'פרסם')}
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleSaveDraft}
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

export default memo(ProductSidePanel);
