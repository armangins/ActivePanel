import { Form, Checkbox, Select, InputNumber } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProductsData } from '@/features/products/hooks/useProductsData';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export const UsageRestrictionStep = () => {
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
            <Form.Item
                name="minimum_amount"
                label={t('minSpend') || 'Minimum spend'}
            >
                <InputNumber style={{ width: '100%' }} min={0} step="0.01" />
            </Form.Item>

            <Form.Item
                name="maximum_amount"
                label={t('maxSpend') || 'Maximum spend'}
            >
                <InputNumber style={{ width: '100%' }} min={0} step="0.01" />
            </Form.Item>

            <Form.Item name="individual_use" valuePropName="checked">
                <Checkbox>
                    {t('individualUseOnly') || 'Individual use only'}
                </Checkbox>
            </Form.Item>

            <Form.Item name="exclude_sale_items" valuePropName="checked">
                <Checkbox>
                    {t('excludeSaleItems') || 'Exclude sale items'}
                </Checkbox>
            </Form.Item>

            <Form.Item
                name="product_ids"
                label={t('products') || 'Products'}
            >
                <Select
                    mode="multiple"
                    placeholder={t('searchProducts') || 'Search products...'}
                    filterOption={false}
                    onSearch={setProductSearch}
                    loading={productsLoading}
                    options={productOptions}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                name="excluded_product_ids"
                label={t('excludeProducts') || 'Exclude Products'}
            >
                <Select
                    mode="multiple"
                    placeholder={t('searchProducts') || 'Search products...'}
                    filterOption={false}
                    onSearch={setProductSearch}
                    loading={productsLoading}
                    options={productOptions}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                name="email_restrictions"
                label={t('allowedEmails') || 'Allowed Emails'}
                tooltip={t('emailRestrictionTip') || 'List of email addresses that can use this coupon.'}
            >
                <Select
                    mode="tags"
                    placeholder={t('enterEmail') || 'Enter email and press Enter'}
                    style={{ width: '100%' }}
                    tokenSeparators={[',', ' ']}
                />
            </Form.Item>
        </div>
    );
};
