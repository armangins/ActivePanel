import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Steps } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessage } from '@/contexts/MessageContext';
import {
    NewVariationData,
    generateCombinations,
    calculateTotalCombinations,
    AttributeToCombine,
    getCombinationSignature
} from '../../../utils/variationUtils';
import { useVariationStyles } from './styles';
import { VariationWizardStep } from './VariationWizardStep';
import { VariationReviewStep } from './VariationReviewStep';

interface AddVariationModalProps {
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

export const AddVariationModal: React.FC<AddVariationModalProps> = ({
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
}) => {
    const { t } = useLanguage();
    const message = useMessage();
    const [form] = Form.useForm();
    const styles = useVariationStyles();

    // Workflow state
    const [step, setStep] = useState<0 | 1>(0); // 0: Define Attributes & Values, 1: Review & Pricing

    // For Wizard Mode: We track currently selected attributes AND their selected values.
    const [wizardAttributes, setWizardAttributes] = useState<Record<number, string[]>>({});

    // Active attributes list
    const [activeAttributeIds, setActiveAttributeIds] = useState<number[]>([]);

    useEffect(() => {
        if (visible) {
            if (isEditing && initialValues?.attributes) {
                const ids = initialValues.attributes.map((a: any) => a.id);
                setActiveAttributeIds(ids);
                const initialVals: Record<number, string[]> = {};
                initialValues.attributes.forEach((a: any) => {
                    initialVals[a.id] = [a.option];
                });
                setWizardAttributes(initialVals);
                setStep(1);
            } else if (existingAttributes && existingAttributes.length > 0) {
                const ids = existingAttributes.map((a: any) => a.id);
                setActiveAttributeIds(ids);
                setWizardAttributes({});
                setStep(0);
            } else {
                setActiveAttributeIds([]);
                setWizardAttributes({});
                setStep(0);
            }
        }
    }, [visible, isEditing, initialValues, existingAttributes]);

    useEffect(() => {
        if (visible) {
            form.resetFields();
            if (initialValues) {
                form.setFieldsValue({ ...initialValues });
            } else {
                form.setFieldsValue({
                    manage_stock: parentManageStock,
                    stock_quantity: parentStockQuantity,
                    stock_status: 'instock',
                    sku: parentSku
                });
            }
        }
    }, [visible, form, initialValues, parentManageStock, parentStockQuantity, parentSku]);

    const totalCombinations = calculateTotalCombinations(activeAttributeIds, wizardAttributes);

    const [variationImages, setVariationImages] = useState<Record<string, any>>({});

    const handleWizardAttributeValueSelect = (attrId: number, value: string) => {
        setWizardAttributes(prev => {
            const currentValues = prev[attrId] || [];
            if (currentValues.includes(value)) {
                return { ...prev, [attrId]: currentValues.filter(v => v !== value) };
            } else {
                return { ...prev, [attrId]: [...currentValues, value] };
            }
        });
    };

    const handleImageChange = (signature: string, image: any) => {
        setVariationImages(prev => ({ ...prev, [signature]: image }));
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
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

                    const variationData: NewVariationData = {
                        attributes: selectedAttributes,
                        sku: values.sku,
                        regular_price: values.regular_price,
                        sale_price: values.sale_price,
                        manage_stock: values.manage_stock,
                        stock_quantity: values.stock_quantity,
                        stock_status: values.stock_status || 'instock'
                    };
                    onAdd(variationData);
                } else {
                    // GENERATING NEW VARIATIONS
                    const attributesToCombine: AttributeToCombine[] = activeAttributeIds.map(id => {
                        const attr = globalAttributes.find((a: any) => a.id === id);
                        return {
                            id: id,
                            name: attr?.name || '',
                            values: wizardAttributes[id] || []
                        };
                    }).filter(a => a.values.length > 0);

                    if (attributesToCombine.length === 0) {
                        message.error(t('selectAtLeastOneAttribute') || 'Select attribute');
                        return;
                    }

                    const rawCombinations = generateCombinations(attributesToCombine);

                    const newVariations = rawCombinations.map((combo, idx) => {
                        const signature = getCombinationSignature(combo);
                        return {
                            attributes: combo,
                            sku: values.sku ? `${values.sku} -${idx + 1} ` : undefined,
                            regular_price: values.regular_price,
                            sale_price: values.sale_price,
                            manage_stock: values.manage_stock,
                            stock_quantity: values.stock_quantity,
                            stock_status: values.stock_status || 'instock',
                            image: variationImages[signature]
                        };
                    });

                    onAdd(newVariations);
                }

                cleanup();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const cleanup = () => {
        form.resetFields();
        setWizardAttributes({});
        setVariationImages({});
        setActiveAttributeIds([]);
        setStep(0);
        onCancel();
    };

    const modalTitle = (
        <div>
            <div style={styles.modalTitleStyle}>{t('productVariationGenerator')}</div>
            <div style={styles.modalDescStyle}>
                {t('variationGeneratorDesc')}
            </div>
        </div>
    );

    const modalFooter = (
        <div style={styles.footerContainerStyle}>
            <div>
                {step === 0 && activeAttributeIds.length > 0 && (
                    <span style={styles.footerInfoStyle}>
                        {t('generatingCombinations', { count: totalCombinations })}
                    </span>
                )}
            </div>
            <div style={styles.footerButtonsStyle}>
                <Button onClick={onCancel}>{t('cancel')}</Button>
                {step === 0 ? (
                    <Button
                        type="primary"
                        onClick={() => {
                            if (activeAttributeIds.length === 0) {
                                message.error(t('selectAtLeastOneAttribute') || "Select attribute");
                                return;
                            }
                            if (totalCombinations === 0) {
                                message.error(t('selectValuesForEachAttribute'));
                                return;
                            }
                            setStep(1);
                        }}
                    >
                        {t('nextReviewPricing')}
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => setStep(0)}>{t('back')}</Button>
                        <Button type="primary" onClick={handleOk}>
                            {isEditing ? (t('update')) : (t('generateVariationsCount', { count: totalCombinations }) || t('generateVariations'))}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    const previewCombinations = React.useMemo(() => {
        const attributesToCombine: AttributeToCombine[] = activeAttributeIds.map(id => {
            const attr = globalAttributes.find((a: any) => a.id === id);
            return {
                id: id,
                name: attr?.name || '',
                values: wizardAttributes[id] || []
            };
        }).filter(a => a.values.length > 0);

        if (attributesToCombine.length === 0) return [];
        return generateCombinations(attributesToCombine);
    }, [activeAttributeIds, wizardAttributes, globalAttributes]);

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onOk={() => { }} // Handled in footer
            onCancel={onCancel}
            width={800}
            footer={modalFooter}
        >
            <div style={styles.stepsContainerStyle}>
                <Steps
                    labelPlacement="vertical"
                    current={step}
                    items={[
                        { title: t('בחר תכונות') },
                        { title: t('תמחור') },
                    ]}
                />
            </div>

            {step === 0 ? (
                <VariationWizardStep
                    globalAttributes={globalAttributes}
                    activeAttributeIds={activeAttributeIds}
                    setActiveAttributeIds={setActiveAttributeIds}
                    wizardAttributes={wizardAttributes}
                    onAttributeValueSelect={handleWizardAttributeValueSelect}
                    form={form}
                />
            ) : (
                <VariationReviewStep
                    form={form}
                    combinations={previewCombinations}
                    images={variationImages}
                    onImageChange={handleImageChange}
                />
            )}
        </Modal>
    );
};
