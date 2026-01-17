import React from 'react';
import { Modal, Button, Steps } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewVariationData, calculateTotalCombinations } from '../../../utils/variationUtils';
import { useVariationStyles } from './styles';
import { VariationWizardStep } from './VariationWizardStep';
import { VariationConfigurationStep } from './VariationConfigurationStep';
import { VariationSummaryStep } from './VariationSummaryStep';
import { useVariationModalLogic } from './useVariationModalLogic';

interface AddVariationModalProps {
    visible: boolean;
    onCancel: () => void;
    onAdd: (data: NewVariationData | NewVariationData[]) => void;
    globalAttributes?: any[];
    initialValues?: any;
    isEditing?: boolean;
    parentName?: string;
    parentSku?: string;
    parentManageStock?: boolean;
    parentStockQuantity?: number;
    existingAttributes?: any[];
}

/**
 * Modal to add or edit product variations.
 * Uses a 3-step wizard workflow:
 * 0. Select Attributes & Values
 * 1. Configuration (Price, Stock, Image) - Manual or Auto
 * 2. Summary
 * 
 * Logic is handled by `useVariationModalLogic`.
 */
export const AddVariationModal: React.FC<AddVariationModalProps> = (props) => {
    const { t } = useLanguage();
    const styles = useVariationStyles();

    // Use the custom hook for logic
    const {
        form,
        step,
        setStep,
        activeAttributeIds,
        setActiveAttributeIds,
        wizardAttributes,
        handleWizardAttributeValueSelect,
        variationData,
        handleConfigChange,
        previewCombinations,
        totalCombinations,
        handleNext,
        handleOk,
        generationMode,
        addManualCombination,
        removeManualCombination,
        updateManualCombination,
        switchToManualWithAutoData
    } = useVariationModalLogic(props);

    const { onCancel, visible, isEditing, globalAttributes, existingAttributes } = props;

    // --- Render Helpers ---

    const modalTitle = (
        <div>
            <div style={styles.modalTitleStyle}>{t('productVariationGenerator')}</div>
            <div style={styles.modalDescStyle}>
                {isEditing ? t('editVariation') : t('variationGeneratorDesc')}
            </div>
        </div>
    );

    const stepItems = [
        { title: t('attributes') },
        { title: t('pricingAndStock') },
        { title: t('summary') },
    ];

    const modalFooter = (
        <div style={styles.footerContainerStyle}>
            <div>
                {step === 0 && activeAttributeIds.length > 0 && generationMode === 'auto' && (
                    <span style={styles.footerInfoStyle}>
                        {t('generatingCombinations', { count: calculateTotalCombinations(activeAttributeIds, wizardAttributes) })}
                    </span>
                )}
            </div>
            <div style={styles.footerButtonsStyle}>
                <Button onClick={onCancel}>{t('cancel')}</Button>

                {step === 0 && (
                    <Button type="primary" onClick={switchToManualWithAutoData}>
                        {t('generateAllCombinations') || 'Generate All'}
                    </Button>
                )}

                {step === 1 && (
                    <>
                        <Button onClick={() => setStep(0)}>{t('back')}</Button>
                        <Button type="primary" onClick={handleNext}>
                            {t('summary')}
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Button onClick={() => setStep(1)}>{t('back')}</Button>
                        <Button type="primary" onClick={handleOk}>
                            {isEditing ? t('saveChanges') : t('generateVariations')}
                        </Button>
                    </>
                )}
            </div>
        </div >
    );

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onCancel={onCancel}
            footer={modalFooter}
            width={900}
            destroyOnClose
            maskClosable={false}
        >
            {!isEditing && (
                <div style={styles.stepsContainerStyle}>
                    <Steps current={step} items={stepItems} size="small" />
                </div>
            )}

            {step === 0 && (
                <VariationWizardStep
                    globalAttributes={globalAttributes || []}
                    activeAttributeIds={activeAttributeIds}
                    setActiveAttributeIds={setActiveAttributeIds}
                    wizardAttributes={wizardAttributes}
                    onAttributeValueSelect={handleWizardAttributeValueSelect}
                    form={form}
                    existingAttributes={existingAttributes}
                />
            )}

            {step === 1 && (
                <VariationConfigurationStep
                    combinations={previewCombinations}
                    data={variationData}
                    onChange={handleConfigChange}
                    isManual={generationMode === 'manual'}
                    onAddRow={addManualCombination}
                    onRemoveRow={removeManualCombination}
                    onUpdateCombo={updateManualCombination}
                    activeAttributes={activeAttributeIds.map(id => {
                        const attr = (globalAttributes || []).find((a: any) => a.id === id) ||
                            (existingAttributes || []).find((a: any) => a.id === id || a.name === id);
                        return attr ? {
                            ...attr,
                            options: wizardAttributes[id] || []  // Only selected values, not all available terms
                        } : null;
                    }).filter(Boolean)}
                />
            )}

            {step === 2 && (
                <VariationSummaryStep
                    combinations={previewCombinations}
                    data={variationData}
                    total={totalCombinations}
                />
            )}
        </Modal>
    );
};
