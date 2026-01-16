import { useState, useEffect, useMemo } from 'react';
import { Form, Modal } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessage } from '@/contexts/MessageContext';
import {
    NewVariationData,
    generateCombinations,
    calculateTotalCombinations,
    AttributeToCombine,
    getCombinationSignature
} from '../../../utils/variationUtils';
import { VariationConfigData } from './VariationConfigurationStep';

export interface UseVariationModalLogicProps {
    visible: boolean;
    onCancel: () => void;
    onAdd: (data: NewVariationData | NewVariationData[]) => void;
    globalAttributes?: any[];
    initialValues?: any;
    isEditing?: boolean;
    parentSku?: string;
    parentManageStock?: boolean;
    parentStockQuantity?: number;
    existingAttributes?: any[];
}

/**
 * Custom hook to manage the business logic and state of the AddVariationModal.
 * Handles the 3-step wizard flow, attribute selection, combination generation,
 * and final form submission.
 * 
 * @param props - Modal properties including callbacks and initial data
 */
export const useVariationModalLogic = ({
    visible,
    onCancel,
    onAdd,
    globalAttributes = [],
    initialValues,
    isEditing = false,
    parentSku = '',
    parentManageStock = false,
    parentStockQuantity,
    existingAttributes = []
}: UseVariationModalLogicProps) => {
    const { t } = useLanguage();
    const message = useMessage();
    const [form] = Form.useForm();

    // Workflow state: 0=Attributes, 1=Values, 2=Configuration, 3=Summary
    const [step, setStep] = useState<0 | 1 | 2>(0);

    // Generation logic state
    const [generationMode, setGenerationMode] = useState<'auto' | 'manual'>('auto');

    // For Wizard Mode: We track currently selected attributes AND their selected values.
    const [wizardAttributes, setWizardAttributes] = useState<Record<string | number, string[]>>({});

    // Active attributes list
    const [activeAttributeIds, setActiveAttributeIds] = useState<(number | string)[]>([]);

    // Manual Mode State
    const [manualCombinations, setManualCombinations] = useState<{ id: number | string; name: string; option: string }[][]>([]);

    // Merged Data State for Step 2 (Config)
    const [variationData, setVariationData] = useState<Record<string, VariationConfigData>>({});

    useEffect(() => {
        if (visible) {
            // Initialization logic - Only run when modal opens
            if (isEditing && initialValues?.attributes) {
                const ids = initialValues.attributes.map((a: any) => a.id);
                setActiveAttributeIds(ids);
                const initialVals: Record<number, string[]> = {};
                initialValues.attributes.forEach((a: any) => {
                    initialVals[a.id] = [a.option];
                });
                setWizardAttributes(initialVals);

                // Initialize variation data for editing
                const signature = getCombinationSignature(initialValues.attributes);
                setVariationData({
                    [signature]: {
                        regular_price: initialValues.regular_price || '',
                        sale_price: initialValues.sale_price || '',
                        stock_quantity: initialValues.stock_quantity,
                        image: initialValues.image,
                        sku: initialValues.sku // Ensure SKU is loaded if editing
                    }
                });

                setGenerationMode('manual');
                setStep(1); // Go to Config directly for editing (Step index 1 in 0,1,2 flow might be confusing if 1 is Config? No: 0=Attr, 1=Config, 2=Summary. So 1 is correct.)
            } else if (existingAttributes && existingAttributes.length > 0) {
                // Pre-select existing attributes if any but treat as new flow start
                const ids = existingAttributes.map((a: any) => a.id > 0 ? a.id : a.name);
                setActiveAttributeIds(ids);
                setWizardAttributes({}); // Clear prior state
                setStep(0);
                setGenerationMode('auto');
                setManualCombinations([]);
            } else {
                // Reset state for new entry
                setActiveAttributeIds([]);
                setWizardAttributes({});
                setStep(0);
                setGenerationMode('auto');
                setManualCombinations([]);
            }

            // Set Form Initial Values
            const targetValues = initialValues || {
                manage_stock: parentManageStock,
                stock_quantity: parentStockQuantity,
                stock_status: 'instock',
                sku: parentSku
            };
            form.setFieldsValue(targetValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, isEditing, message, t]);


    const totalCombinations = generationMode === 'auto'
        ? calculateTotalCombinations(activeAttributeIds, wizardAttributes)
        : manualCombinations.length;

    const handleWizardAttributeValueSelect = (attrId: number | string, value: string) => {
        setWizardAttributes(prev => {
            const currentValues = prev[attrId] || [];
            if (currentValues.includes(value)) {
                return { ...prev, [attrId]: currentValues.filter(v => v !== value) };
            } else {
                return { ...prev, [attrId]: [...currentValues, value] };
            }
        });
    };

    const handleConfigChange = (signature: string, field: keyof VariationConfigData, value: any) => {
        setVariationData(prev => ({
            ...prev,
            [signature]: {
                ...prev[signature],
                [field]: value
            }
        }));
    };

    // Manual Mode Handlers
    const addManualCombination = () => {
        // Create an empty combo based on active attributes
        const newCombo = activeAttributeIds.map(id => {
            const attr = globalAttributes.find((a: any) => a.id === id) ||
                existingAttributes.find((a: any) => (a.id === id) || (a.id === 0 && a.name === id));
            return {
                id: id,
                name: attr?.name || String(id),
                option: '' // Empty initially
            };
        });
        setManualCombinations(prev => [...prev, newCombo]);
    };

    const removeManualCombination = (index: number) => {
        setManualCombinations(prev => prev.filter((_, i) => i !== index));
    };

    const updateManualCombination = (rowIndex: number, attrId: number | string, value: string) => {
        setManualCombinations(prev => {
            const newCombos = [...prev];
            const row = newCombos[rowIndex].map(item => ({ ...item }));
            const target = row.find(i => i.id === attrId);
            if (target) target.option = value;
            newCombos[rowIndex] = row;
            return newCombos;
        });
    };

    const previewCombinations = useMemo(() => {
        if (generationMode === 'manual') {
            return manualCombinations;
        }

        const attributesToCombine: AttributeToCombine[] = activeAttributeIds.map(id => {
            const attr = globalAttributes.find((a: any) => a.id === id) ||
                existingAttributes.find((a: any) => (a.id === id) || (a.id === 0 && a.name === id));
            return {
                id: id,
                name: attr?.name || String(id),
                values: wizardAttributes[id] || []
            };
        }).filter(a => a.values.length > 0);

        if (attributesToCombine.length === 0) return [];

        // IMPORTANT: generateCombinations expects 2 arguments in recursion, but external call uses 1 array
        return generateCombinations(attributesToCombine);
    }, [activeAttributeIds, wizardAttributes, globalAttributes, existingAttributes, generationMode, manualCombinations]);


    const handleModeSelect = (mode: 'auto' | 'manual') => {
        setGenerationMode(mode);
        if (mode === 'manual' && manualCombinations.length === 0) {
            addManualCombination();
        }

        // Validate Step 0 before moving
        if (activeAttributeIds.length === 0) {
            message.error(t('selectAtLeastOneAttribute'));
            return;
        }

        // Even in Manual mode, having some "base" attributes defined is helpful, 
        // though logic allows adding rows. But layout assumes attributes are known 
        // (columns in Manual table).

        setStep(1); // Move to Configuration
    };

    const handleNext = () => {
        if (step === 0) {
            // Step 0: Attributes (and implied values for Auto)
            if (activeAttributeIds.length === 0) {
                if (activeAttributeIds.length === 0) {
                    message.error(t('selectAtLeastOneAttribute'));
                    return;
                }
                return;
            }
            // Auto-advance logic usually happens via Mode Buttons in Footer for Step 0.
            // But if called directly:
            setStep(1);
        } else if (step === 1) {
            // Step 1: Configuration
            // STRICT VALIDATION: Options Selected (Manual Mode)
            if (generationMode === 'manual') {
                const missingOptions = previewCombinations.some(combo => combo.some((c: any) => !c.option));
                if (missingOptions) {
                    if (missingOptions) {
                        message.error(t('selectAllOptions'));
                        return;
                    }
                    return;
                }
                if (previewCombinations.length === 0) {
                    if (previewCombinations.length === 0) {
                        message.error(t('addAtLeastOneVariation'));
                        return;
                    }
                    return;
                }
            }

            // STRICT VALIDATION: Price and Quantity
            const missingRequired = previewCombinations.some((combo: any) => {
                const sig = getCombinationSignature(combo);
                const data = variationData[sig];
                return !data?.regular_price; // || data?.stock_quantity === null; // Stock might be opt?
            });

            if (missingRequired) {
                if (missingRequired) {
                    message.error(t('fillRequiredFields'));
                    return;
                }
                return;
            }

            // SOFT VALIDATION: Images
            const missingImages = previewCombinations.some((combo: any) => {
                const sig = getCombinationSignature(combo);
                return !variationData[sig]?.image;
            });

            if (missingImages) {
                Modal.confirm({
                    title: t('missingImagesWarning'),
                    content: t('missingImagesConfirm'),
                    okText: t('yes'),
                    cancelText: t('no'),
                    onOk: () => setStep(2) // Move to Summary (Step 2)
                });
            } else {
                setStep(2); // Move to Summary (Step 2)
            }
        }
    };

    const handleBack = () => {
        if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2);
    };

    const cleanup = () => {
        form.resetFields();
        setWizardAttributes({});
        setVariationData({});
        setActiveAttributeIds([]);
        setManualCombinations([]);
        setStep(0);
        onCancel();
    };

    const handleOk = () => {
        if (isEditing) {
            // EDIT SINGLE MODE
            const selectedAttributes: { id: number; name: string; option: string }[] = [];
            if (initialValues && initialValues.attributes) {
                initialValues.attributes.forEach((attr: any) => {
                    const wizardVals = wizardAttributes[attr.id];
                    if (wizardVals && wizardVals.length > 0) {
                        selectedAttributes.push({
                            id: attr.id,
                            name: attr.name,
                            option: wizardVals[0]
                        });
                    } else {
                        selectedAttributes.push({
                            id: attr.id,
                            name: attr.name,
                            option: attr.option
                        });
                    }
                });
            }

            // Simplified: use the first entry of variationData.
            const keys = Object.keys(variationData);
            const data = variationData[keys[0]]; // Should only be one

            const variationFinal: NewVariationData = {
                attributes: selectedAttributes,
                sku: data.sku || form.getFieldValue('sku'),
                regular_price: data.regular_price,
                sale_price: data.sale_price,
                manage_stock: true, // Always true per requirement
                stock_quantity: data.stock_quantity || 0,
                stock_status: (data.stock_quantity && data.stock_quantity > 0) ? 'instock' : 'outofstock' as 'instock' | 'outofstock',
                image: data.image
            };
            onAdd(variationFinal);
        } else {
            // GENERATING NEW VARIATIONS
            let finalVariations: NewVariationData[] = [];

            if (generationMode === 'manual') {
                // Filter out incomplete rows
                const validRows = manualCombinations.filter(combo => combo.length === activeAttributeIds.length);

                finalVariations = validRows.map(combo => {
                    const signature = getCombinationSignature(combo);
                    const config = variationData[signature] || {};
                    return {
                        attributes: combo,
                        sku: config.sku, // Allow manual mode to support per-row SKU if we add it to config, otherwise undef or base
                        regular_price: config.regular_price,
                        sale_price: config.sale_price,
                        manage_stock: true,
                        stock_quantity: config.stock_quantity || 0,
                        stock_status: (config.stock_quantity && config.stock_quantity > 0) ? 'instock' : 'outofstock',
                        image: config.image
                    } as NewVariationData;
                });
            } else {
                const combinations = generateCombinations(activeAttributeIds.map(id => {
                    const attr = globalAttributes.find((a: any) => a.id === id) ||
                        existingAttributes.find((a: any) => (a.id === id) || (a.id === 0 && a.name === id));
                    return {
                        id: id,
                        name: attr?.name || String(id),
                        values: wizardAttributes[id] || []
                    };
                }).filter(a => a.values.length > 0));

                finalVariations = combinations.map((combo, idx) => {
                    const signature = getCombinationSignature(combo);
                    const data = variationData[signature] || {};
                    const baseSku = form.getFieldValue('sku');

                    return {
                        attributes: combo,
                        sku: baseSku ? `${baseSku}-${idx + 1}` : undefined,
                        regular_price: data.regular_price,
                        sale_price: data.sale_price,
                        manage_stock: true, // Always true
                        stock_quantity: data.stock_quantity || 0,
                        stock_status: (data.stock_quantity && data.stock_quantity > 0) ? 'instock' : 'outofstock' as 'instock' | 'outofstock',
                        image: data.image
                    };
                });
            }

            onAdd(finalVariations);
        }

        cleanup();
    };


    const switchToManualWithAutoData = () => {
        const attributesToCombine: AttributeToCombine[] = activeAttributeIds.map(id => {
            const attr = globalAttributes.find((a: any) => a.id === id) ||
                existingAttributes.find((a: any) => (a.id === id) || (a.id === 0 && a.name === id));
            return {
                id: id,
                name: attr?.name || String(id),
                values: wizardAttributes[id] || []
            };
        }).filter(a => a.values.length > 0);

        if (attributesToCombine.length > 0) {
            const generated = generateCombinations(attributesToCombine);
            setManualCombinations(generated);
        }
        setGenerationMode('manual');
        setStep(1);
    };

    return {
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
        handleBack,
        handleOk,
        generationMode,
        setGenerationMode,
        handleModeSelect,
        addManualCombination,
        removeManualCombination,
        updateManualCombination,
        switchToManualWithAutoData
    };
};
