import { Form, Input, Select, Checkbox, DatePicker, Row, Col, Button } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReloadOutlined } from '@ant-design/icons';

interface GeneralStepProps {
    form: any;
    generateRandomCode: () => void;
}

export const GeneralStep = ({ form, generateRandomCode }: GeneralStepProps) => {
    const { t } = useLanguage();
    const discountType = Form.useWatch('discount_type', form);

    const discountOptions = [
        { label: t('percentageDiscount') || 'Percentage discount', value: 'percent' },
        { label: t('fixedCartDiscount') || 'Fixed cart discount', value: 'fixed_cart' },
        { label: t('fixedProductDiscount') || 'Fixed product discount', value: 'fixed_product' }
    ];

    return (
        <div style={{ paddingTop: 20 }}>
            <Row gutter={16}>
                <Col span={18}>
                    <Form.Item
                        name="code"
                        label={t('couponCode') || 'Coupon Code'}
                        rules={[{ required: true, message: t('codeRequired') || 'Code is required' }]}
                    >
                        <Input placeholder={t('enterCouponCode') || 'e.g. SUMMER2024'} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label=" ">
                        <Button onClick={generateRandomCode} icon={<ReloadOutlined />} block>
                            {t('generate') || 'Generate'}
                        </Button>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="description"
                label={t('description') || 'Description'}
            >
                <Input.TextArea rows={2} placeholder={t('couponDescription') || 'Optional description for this coupon'} />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="discount_type"
                        label={t('discountType') || 'Discount Type'}
                        rules={[{ required: true }]}
                    >
                        <Select options={discountOptions} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="amount"
                        label={t('couponAmount') || 'Coupon Amount'}
                        rules={[{ required: true, message: t('amountRequired') || 'Amount is required' }]}
                        help={discountType === 'percent' ? t('percentTip') || 'Enter value without %' : undefined}
                    >
                        <Input type="number" min="0" step="0.01" prefix={discountType !== 'percent' ? '$' : undefined} suffix={discountType === 'percent' ? '%' : undefined} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="date_expires"
                label={t('expiryDate') || 'Expiry Date'}
            >
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="free_shipping" valuePropName="checked">
                <Checkbox>
                    {t('allowFreeShipping') || 'Allow free shipping'}
                </Checkbox>
            </Form.Item>
            <div style={{ color: '#888', fontSize: 12, marginTop: -10, marginBottom: 24, paddingLeft: 24 }}>
                {t('freeShippingTip') || 'Check this box if the coupon grants free shipping. A free shipping method must be enabled in your shipping zone and be set to require "a valid free shipping coupon".'}
            </div>
        </div>
    );
};
