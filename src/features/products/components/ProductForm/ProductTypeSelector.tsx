import React from 'react';
import { Form, Segmented, ConfigProvider, Tooltip } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '@/features/products/types/schemas';

interface ProductTypeSelectorProps {
    control: Control<ProductFormValues>;
    setValue: any; // Using any for simplicity or UseFormSetValue<ProductFormValues>
}

export const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({ control, setValue }) => {
    const { t } = useLanguage();

    return (
        <Form.Item label={t('productType')}>
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <ConfigProvider
                        theme={{
                            components: {
                                Segmented: {
                                    itemSelectedBg: '#1677ff',
                                    itemSelectedColor: '#ffffff',
                                    trackBg: '#e5e5e5',
                                    itemColor: '#262626',
                                    itemHoverColor: '#1677ff',
                                    itemHoverBg: 'rgba(0,0,0,0.05)',
                                },
                            },
                        }}
                    >
                        <Segmented
                            options={[
                                {
                                    label: (
                                        <Tooltip title={t('simpleProductTooltip')} placement="top">
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {t('simpleProduct')}
                                            </div>
                                        </Tooltip>
                                    ),
                                    value: 'simple'
                                },
                                {
                                    label: (
                                        <Tooltip title={t('variableProductTooltip')} placement="top">
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {t('variableProduct')}
                                            </div>
                                        </Tooltip>
                                    ),
                                    value: 'variable'
                                },
                            ]}
                            block
                            size="large"
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                if (value === 'variable') {
                                    // Enforce manage_stock = true for variable products as default
                                    setValue('manage_stock', true, { shouldDirty: true });
                                }
                            }}
                        />
                    </ConfigProvider>
                )}
            />
        </Form.Item>
    );
};
