import { Form, Input, Space, Card, Row, Col } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';

interface ShippingTabProps {
    control: Control<ProductFormValues>;
}

export const ShippingTab = ({ control }: ShippingTabProps) => {
    const { t } = useLanguage();

    return (
        <Card variant="borderless">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <Form.Item label={t('weight')}>
                        <Controller
                            name="weight"
                            control={control}
                            render={({ field }) => <Input {...field} suffix="kg" />}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                    <Form.Item label={t('dimensions')}>
                        <Space>
                            <Controller
                                name="dimensions.length"
                                control={control}
                                render={({ field }) => <Input {...field} placeholder={t('length')} />}
                            />
                            <Controller
                                name="dimensions.width"
                                control={control}
                                render={({ field }) => <Input {...field} placeholder={t('width')} />}
                            />
                            <Controller
                                name="dimensions.height"
                                control={control}
                                render={({ field }) => <Input {...field} placeholder={t('height')} />}
                            />
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );
};
