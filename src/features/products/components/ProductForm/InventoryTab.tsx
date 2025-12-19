import { Form, Input, Select, InputNumber, Switch, Button, Card, Row, Col } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';

const { Option } = Select;

interface InventoryTabProps {
    control: Control<ProductFormValues>;
    handleGenerateSKU: () => void;
}

export const InventoryTab = ({ control, handleGenerateSKU }: InventoryTabProps) => {
    const { t } = useLanguage();

    return (
        <Card bordered={false}>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Form.Item label={t('sku')}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Controller
                                name="sku"
                                control={control}
                                render={({ field }) => <Input {...field} />}
                            />
                            <Button onClick={handleGenerateSKU}>{t('generate')}</Button>
                        </div>
                    </Form.Item>
                    <Form.Item label={t('stockStatus')}>
                        <Controller
                            name="stock_status"
                            control={control}
                            render={({ field }) => (
                                <Select {...field}>
                                    <Option value="instock">{t('inStock')}</Option>
                                    <Option value="outofstock">{t('outOfStock')}</Option>
                                    <Option value="onbackorder">{t('onBackorder')}</Option>
                                </Select>
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={t('manageStock')} valuePropName="checked">
                        <Controller
                            name="manage_stock"
                            control={control}
                            render={({ field }) => <Switch {...field} checked={field.value} />}
                        />
                    </Form.Item>
                    <Controller
                        name="manage_stock"
                        control={control}
                        render={({ field }) => field.value ? (
                            <Form.Item label={t('stockQuantity')}>
                                <Controller
                                    name="stock_quantity"
                                    control={control}
                                    render={({ field }) => <InputNumber {...field} style={{ width: '100%' }} />}
                                />
                            </Form.Item>
                        ) : <></>}
                    />
                </Col>
            </Row>
        </Card>
    );
};
