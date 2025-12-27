import { Form, Checkbox, Select, InputNumber } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProductsData } from '@/features/products/hooks/useProductsData';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Controller } from 'react-hook-form';

interface UsageRestrictionStepProps {
    form: any;
}

export const UsageRestrictionStep = ({ form }: UsageRestrictionStepProps) => {
    const { t } = useLanguage();
    const [productSearch, setProductSearch] = useState('');
    const [debouncedProductSearch] = useDebounce(productSearch, 500);

    // Fetch products for filtering (searchable)
    const { data: productsData, isLoading: productsLoading } = useProductsData({
        search: debouncedProductSearch,
        per_page: 20
    });

    const productOptions = productsData?.data?.map((p: any) => ({
        label: `${p.name} (ID: ${p.id})`,
        value: p.id
    })) || [];

    return (
        <div style={{ paddingTop: 20 }}>
            <Controller
                name="minimum_amount"
                control={form.control}
                render={({ field }) => (
                    <Form.Item label={t('minSpend') || 'Minimum spend'}>
                        <InputNumber {...field} style={{ width: '100%' }} min="0" step="0.01" stringMode />
                    </Form.Item>
                )}
            />

            <Controller
                name="maximum_amount"
                control={form.control}
                render={({ field }) => (
                    <Form.Item label={t('maxSpend') || 'Maximum spend'}>
                        <InputNumber {...field} style={{ width: '100%' }} min="0" step="0.01" stringMode />
                    </Form.Item>
                )}
            />

            <Controller
                name="individual_use"
                control={form.control}
                render={({ field: { value, onChange, ...field } }) => (
                    <Form.Item>
                        <Checkbox checked={value} onChange={onChange} {...field}>
                            {t('individualUseOnly') || 'Individual use only'}
                        </Checkbox>
                    </Form.Item>
                )}
            />

            <Controller
                name="exclude_sale_items"
                control={form.control}
                render={({ field: { value, onChange, ...field } }) => (
                    <Form.Item>
                        <Checkbox checked={value} onChange={onChange} {...field}>
                            {t('excludeSaleItems') || 'Exclude sale items'}
                        </Checkbox>
                    </Form.Item>
                )}
            />

            <Controller
                name="product_ids"
                control={form.control}
                render={({ field }) => (
                    <Form.Item label={t('products') || 'Products'}>
                        <Select
                            {...field}
                            mode="multiple"
                            placeholder={t('searchProducts') || 'Search products...'}
                            filterOption={false}
                            onSearch={setProductSearch}
                            loading={productsLoading}
                            options={productOptions}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                )}
            />

            <Controller
                name="excluded_product_ids"
                control={form.control}
                render={({ field }) => (
                    <Form.Item label={t('excludeProducts') || 'Exclude Products'}>
                        <Select
                            {...field}
                            mode="multiple"
                            placeholder={t('searchProducts') || 'Search products...'}
                            filterOption={false}
                            onSearch={setProductSearch}
                            loading={productsLoading}
                            options={productOptions}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                )}
            />

            <Controller
                name="email_restrictions"
                control={form.control}
                render={({ field }) => (
                    <Form.Item
                        label={t('allowedEmails') || 'Allowed Emails'}
                        tooltip={t('emailRestrictionTip') || 'List of email addresses that can use this coupon.'}
                    >
                        <Select
                            {...field}
                            mode="tags"
                            placeholder={t('enterEmail') || 'Enter email and press Enter'}
                            style={{ width: '100%' }}
                            tokenSeparators={[',', ' ']}
                        />
                    </Form.Item>
                )}
            />
        </div>
    );
};
