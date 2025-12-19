import React, { useState } from 'react';
import { Form, Input, Row, Col, Tooltip, DatePicker, Popover } from 'antd';
import { Controller, Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { CalculatorOutlined, CalendarOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { SmartPricingModal } from './SmartPricingModal';

interface ProductPricingProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({ control, errors, setValue }) => {
    const { t } = useLanguage();
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isScheduleVisible, setIsScheduleVisible] = useState(false);

    const handleApplyPrice = (price: number) => {
        setValue('regular_price', price.toString(), { shouldValidate: true, shouldDirty: true });
    };

    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t('regularPrice')} validateStatus={errors.regular_price ? 'error' : ''} help={errors.regular_price?.message}>
                        <Controller
                            name="regular_price"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix="$"
                                    suffix={
                                        <Tooltip title={t('smartPricing') || "Smart Pricing Tool"}>
                                            <CalculatorOutlined
                                                style={{ cursor: 'pointer', color: '#1890ff' }}
                                                onClick={() => setIsPricingModalVisible(true)}
                                            />
                                        </Tooltip>
                                    }
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t('salePrice')}>
                        <Controller
                            name="sale_price"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix="$"
                                    suffix={
                                        <Popover
                                            content={
                                                <div style={{ padding: 8 }}>
                                                    <DatePicker.RangePicker
                                                        style={{ width: 280 }}
                                                        onChange={(_, dateStrings) => {
                                                            setValue('date_on_sale_from', dateStrings[0]);
                                                            setValue('date_on_sale_to', dateStrings[1]);
                                                        }}
                                                    />
                                                </div>
                                            }
                                            title={t('scheduleSale')}
                                            trigger="click"
                                            open={isScheduleVisible}
                                            onOpenChange={setIsScheduleVisible}
                                            placement="bottomRight"
                                        >
                                            <Tooltip title={t('scheduleSale')}>
                                                <CalendarOutlined
                                                    className="cursor-pointer text-blue-500 hover:text-blue-700"
                                                />
                                            </Tooltip>
                                        </Popover>
                                    }
                                />
                            )}
                        />
                    </Form.Item>

                </Col>
            </Row>

            <SmartPricingModal
                visible={isPricingModalVisible}
                onClose={() => setIsPricingModalVisible(false)}
                onApplyPrice={handleApplyPrice}
            />
        </>
    );
};
