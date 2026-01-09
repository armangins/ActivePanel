import { Form, Input, InputNumber, Select, Button, Space, Divider } from 'antd';
import { Variation } from '../types';
import { useVariationForm } from '../hooks/useVariationForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface VariationFormProps {
    productId: number;
    variation?: Variation | null;
    attributes: any[]; // Ideally strict type from parent
    onCancel: () => void;
    onSuccess: () => void;
}

export const VariationForm = ({ productId, variation, attributes, onCancel, onSuccess }: VariationFormProps) => {
    const { t, isRTL } = useLanguage();
    const { form, isLoading, onSubmit, isEditMode } = useVariationForm({
        productId,
        variation,
        onSuccess
    });

    const { formState: { errors }, setValue, watch } = form; // Ant Design inputs controlled manually or via Controller

    // Helper for controlled inputs with React Hook Form
    // Using simple value/onChange binding for Ant Design components

    return (
        <Form layout="vertical" onFinish={onSubmit} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <Divider orientation="left">{t('attributes')}</Divider>
            {attributes.map((attr, index) => (
                <Form.Item
                    key={attr.id}
                    label={attr.name}
                    required
                    validateStatus={form.formState.errors.attributes?.[index]?.option ? 'error' : ''}
                    help={form.formState.errors.attributes?.[index]?.option?.message}
                >
                    <Select
                        value={watch(`attributes.${index}.option`)}
                        onChange={(val) => {
                            setValue(`attributes.${index}.id`, attr.id);
                            setValue(`attributes.${index}.name`, attr.name);
                            setValue(`attributes.${index}.option`, val);
                        }}
                        options={attr.options.map((opt: string) => ({ label: opt, value: opt }))}
                    />
                </Form.Item>
            ))}

            <Divider orientation="left">{t('pricingAndStock')}</Divider>

            <Space style={{ display: 'flex' }} align="start">
                <Form.Item label={t('sku')}>
                    <Input
                        value={watch('sku')}
                        onChange={e => setValue('sku', e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label={t('regularPrice')}
                    required
                    validateStatus={errors.regular_price ? 'error' : ''}
                    help={errors.regular_price?.message}
                >
                    <Input
                        prefix="₪"
                        value={watch('regular_price')}
                        onChange={e => setValue('regular_price', e.target.value)}
                    />
                </Form.Item>

                <Form.Item label={t('salePrice')}>
                    <Input
                        prefix="₪"
                        value={watch('sale_price')}
                        onChange={e => setValue('sale_price', e.target.value)}
                    />
                </Form.Item>
            </Space>

            <Space style={{ display: 'flex' }}>
                <Form.Item label={t('stockStatus')}>
                    <Select
                        value={watch('stock_status')}
                        onChange={val => setValue('stock_status', val as any)}
                        options={[
                            { label: t('instock'), value: 'instock' },
                            { label: t('outofstock'), value: 'outofstock' },
                            { label: t('onbackorder'), value: 'onbackorder' }
                        ]}
                        style={{ width: 120 }}
                    />
                </Form.Item>

                <Form.Item label={t('quantity')}>
                    <InputNumber
                        value={watch('stock_quantity')}
                        onChange={val => setValue('stock_quantity', val as number)}
                        min={0}
                    />
                </Form.Item>
            </Space>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Space>
                    <Button onClick={onCancel} disabled={isLoading}>
                        {t('cancel')}
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {isEditMode ? t('update') : t('create')}
                    </Button>
                </Space>
            </div>
        </Form>
    );
};
