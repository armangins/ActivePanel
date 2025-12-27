import { Form, Input, Select, Checkbox, DatePicker, Row, Col, Button } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReloadOutlined } from '@ant-design/icons';
import { Controller, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';

interface GeneralStepProps {
    form: any;
    generateRandomCode: () => void;
}

export const GeneralStep = ({ form, generateRandomCode }: GeneralStepProps) => {
    const { t } = useLanguage();
    const discountType = useWatch({ control: form.control, name: 'discount_type' });

    const discountOptions = [
        { label: t('percentageDiscount') || 'Percentage discount', value: 'percent' },
        { label: t('fixedCartDiscount') || 'Fixed cart discount', value: 'fixed_cart' },
        { label: t('fixedProductDiscount') || 'Fixed product discount', value: 'fixed_product' }
    ];

    return (
        <div style={{ paddingTop: 20 }}>
            <Row gutter={16}>
                <Col span={18}>
                    <Controller
                        name="code"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Form.Item
                                label={t('couponCode') || 'Coupon Code'}
                                validateStatus={fieldState.error ? 'error' : ''}
                                help={fieldState.error?.message}
                                required
                            >
                                <Input {...field} placeholder={t('enterCouponCode') || 'e.g. SUMMER2024'} />
                            </Form.Item>
                        )}
                    />
                </Col>
                <Col span={6}>
                    <Form.Item label=" ">
                        <Button onClick={generateRandomCode} icon={<ReloadOutlined />} block>
                            {t('generate') || 'Generate'}
                        </Button>
                    </Form.Item>
                </Col>
            </Row>

            <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                    <Form.Item label={t('description') || 'Description'}>
                        <Input.TextArea {...field} rows={2} placeholder={t('couponDescription') || 'Optional description for this coupon'} />
                    </Form.Item>
                )}
            />

            <Row gutter={16}>
                <Col span={12}>
                    <Controller
                        name="discount_type"
                        control={form.control}
                        render={({ field }) => (
                            <Form.Item label={t('discountType') || 'Discount Type'} required>
                                <Select {...field} options={discountOptions} />
                            </Form.Item>
                        )}
                    />
                </Col>
                <Col span={12}>
                    <Controller
                        name="amount"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Form.Item
                                label={t('couponAmount') || 'Coupon Amount'}
                                validateStatus={fieldState.error ? 'error' : ''}
                                help={fieldState.error?.message || (discountType === 'percent' ? (t('percentTip') || 'Enter value without %') : undefined)}
                                required
                            >
                                <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    prefix={discountType !== 'percent' ? '$' : undefined}
                                    suffix={discountType === 'percent' ? '%' : undefined}
                                />
                            </Form.Item>
                        )}
                    />
                </Col>
            </Row>

            <Controller
                name="date_expires"
                control={form.control}
                render={({ field: { value, onChange, ...field } }) => (
                    <Form.Item label={t('expiryDate') || 'Expiry Date'}>
                        <DatePicker
                            {...field}
                            value={value ? dayjs(value) : null}
                            onChange={(date, dateString) => onChange(dateString)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                )}
            />

            <Controller
                name="free_shipping"
                control={form.control}
                render={({ field: { value, onChange, ...field } }) => (
                    <Form.Item>
                        <Checkbox checked={value} onChange={onChange} {...field}>
                            {t('allowFreeShipping') || 'Allow free shipping'}
                        </Checkbox>
                    </Form.Item>
                )}
            />
            <div style={{ color: '#888', fontSize: 12, marginTop: -10, marginBottom: 24, paddingLeft: 24 }}>
                {t('freeShippingTip') || 'Check this box if the coupon grants free shipping. A free shipping method must be enabled in your shipping zone and be set to require "a valid free shipping coupon".'}
            </div>
        </div>
    );
};
