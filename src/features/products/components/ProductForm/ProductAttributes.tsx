import React from 'react';
import { Button, Typography, Divider, Card, Space, Form, Input, Switch, Select, message } from 'antd';
import { Controller, Control, useFieldArray, UseFormSetValue, useWatch, UseFormGetValues } from 'react-hook-form';
import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { useAttributes } from '@/hooks/useAttributes';
import { GlobalAttributeSelector } from './GlobalAttributeSelector';

import { useVariationGeneration } from '../../hooks/useVariationGeneration';

const { Text } = Typography;

interface ProductAttributesProps {
    control: Control<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    getValues: UseFormGetValues<ProductFormValues>;
}

export const ProductAttributes: React.FC<ProductAttributesProps> = ({ control, setValue, getValues }) => {
    const { t } = useLanguage();

    // Watch parent product prices to inherit for variations
    const parentRegularPrice = useWatch({ control, name: 'regular_price' }) || '';
    const parentSalePrice = useWatch({ control, name: 'sale_price' }) || '';

    // 1. Fetch all available global attributes from WooCommerce
    const { data: globalAttributes = [] } = useAttributes();

    // 2. Manage the form's attributes array
    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes"
    });

    // 3. Watch the current values to sync state
    const currentAttributes = useWatch({ control, name: 'attributes' }) || [];

    // Helper to handle Global Attribute changes (Chip selection)
    const handleGlobalChange = (attrId: number, attrName: string, newTerms: string[]) => {
        const existingIndex = currentAttributes.findIndex((a: any) => a.id === attrId);

        if (existingIndex > -1) {
            // Attribute already exists in form
            if (newTerms.length > 0) {
                // Update terms
                setValue(`attributes.${existingIndex}.options`, newTerms, { shouldDirty: true });
            } else {
                // No terms selected, remove the attribute entirely
                remove(existingIndex);
            }
        } else {
            // Attribute invalid or not present, add it if we have terms
            if (newTerms.length > 0) {
                append({
                    id: attrId,
                    name: attrName,
                    options: newTerms,
                    visible: true,
                    variation: true
                });
            }
        }
    };

    // Use variation generation hook
    const { generateVariations, regenerateVariations } = useVariationGeneration({
        currentAttributes,
        parentRegularPrice,
        parentSalePrice,
        setValue,
        getValues
    });

    return (
        <div>
            {/* SECTION 1: Global Attributes (Visual Selection) */}
            <Typography.Title level={5}>{t('globalAttributes') || 'Global Attributes'}</Typography.Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {t('selectGlobalAttributesDesc') || "Select terms from your global attributes to add them to the product."}
            </Text>

            <Card variant="borderless" style={{ background: '#fafafa', marginBottom: 24 }}>
                {globalAttributes.length === 0 ? (
                    <Text type="secondary">{t('noGlobalAttributes') || "No global attributes found."}</Text>
                ) : (
                    globalAttributes.map((attr: any) => {
                        // Find if currently selected
                        const existing = currentAttributes.find((a: any) => a.id === attr.id);
                        const selectedTerms = existing ? existing.options : [];

                        return (
                            <GlobalAttributeSelector
                                key={attr.id}
                                attributeId={attr.id}
                                attributeName={attr.name}
                                selectedTerms={selectedTerms}
                                onTermsChange={(newTerms) => handleGlobalChange(attr.id, attr.name, newTerms)}
                            />
                        );
                    })
                )}
            </Card>

            {/* Create Variations Buttons */}
            {currentAttributes.length >= 1 && (
                <div style={{ marginTop: 16, marginBottom: 24 }}>
                    <Space>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={generateVariations}
                        >
                            {t('createVariations')} ({t('addNewOnly') || "Add New"})
                        </Button>
                        <Button
                            type="dashed"
                            danger
                            size="large"
                            icon={<SyncOutlined />}
                            onClick={regenerateVariations}
                        >
                            {t('regenerateAll') || "צור את כל הוריאציות"}
                        </Button>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('variationHelp') || "Create Variations adds new combinations. Regenerate All clears and rebuilds everything."}
                        </Text>
                    </div>
                </div>
            )}

            <Divider />

            {/* SECTION 2: Custom Attributes (Manual Entry) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>{t('customAttributes') || 'Custom Attributes'}</Typography.Title>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => append({ id: 0, name: '', options: [], visible: true, variation: true })}
                >
                    {t('addCustomAttribute') || 'Add Custom Attribute'}
                </Button>
            </div>

            {/* Render rows ONLY for Custom Attributes (id === 0) */}
            {fields.map((field, index) => {
                // We use useWatch to check the ID, but fallback to field value if needed? 
                // Actually currentAttributes[index] is safest.
                const attrValues = currentAttributes[index];
                if (!attrValues || attrValues.id !== 0) return null;

                return (
                    <Card
                        key={field.id}
                        size="small"
                        style={{ marginBottom: 16, borderColor: '#d9d9d9' }}
                        title={t('customAttribute')}
                        extra={
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(index)}
                            />
                        }
                    >
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                                <Form.Item label={t('attributeName')} style={{ marginBottom: 0 }} required>
                                    <Controller
                                        name={`attributes.${index}.name`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} placeholder={t('e.g. Material')} />
                                        )}
                                    />
                                </Form.Item>
                            </div>
                            <div style={{ flex: 2 }}>
                                <Form.Item label={t('attributeValues')} style={{ marginBottom: 0 }} required>
                                    <Controller
                                        name={`attributes.${index}.options`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                mode="tags"
                                                style={{ width: '100%' }}
                                                placeholder={t('enterOptions') || "Enter options (e.g. Cotton, Wool)"}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 24 }}>
                            <Controller
                                name={`attributes.${index}.visible`}
                                control={control}
                                render={({ field }) => (
                                    <Space>
                                        <Switch size="small" {...field} checked={field.value} />
                                        <Text type="secondary">{t('visibleOnProductPage')}</Text>
                                    </Space>
                                )}
                            />
                            <Controller
                                name={`attributes.${index}.variation`}
                                control={control}
                                render={({ field }) => (
                                    <Space>
                                        <Switch size="small" {...field} checked={field.value} />
                                        <Text type="secondary">{t('usedForVariations')}</Text>
                                    </Space>
                                )}
                            />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

