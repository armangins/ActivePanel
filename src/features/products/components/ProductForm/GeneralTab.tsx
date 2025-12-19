import { Form, Input, Select, Card, Row, Col } from 'antd';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';

const { TextArea } = Input;
const { Option } = Select;

interface GeneralTabProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    categories: any[];
}

export const GeneralTab = ({ control, errors, categories }: GeneralTabProps) => {
    const { t } = useLanguage();

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
                <Card title={t('basicInfo')} bordered={false}>
                    <Form.Item label={t('productName')} validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder={t('enterProductName')} />}
                        />
                    </Form.Item>
                    <Form.Item label={t('description')}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <TextArea {...field} rows={6} />}
                        />
                    </Form.Item>
                    <Form.Item label={t('shortDescription')}>
                        <Controller
                            name="short_description"
                            control={control}
                            render={({ field }) => <TextArea {...field} rows={3} />}
                        />
                    </Form.Item>
                </Card>
            </Col>
            <Col xs={24} md={8}>
                <Card title={t('organization')} bordered={false}>
                    <Form.Item label={t('status')}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select {...field}>
                                    <Option value="publish">{t('publish')}</Option>
                                    <Option value="draft">{t('draft')}</Option>
                                    <Option value="pending">{t('pending')}</Option>
                                    <Option value="private">{t('private')}</Option>
                                </Select>
                            )}
                        />
                    </Form.Item>
                    <Form.Item label={t('categories')}>
                        <Controller
                            name="categories"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    mode="multiple"
                                    placeholder={t('selectCategories')}
                                    options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                                    onChange={(value) => field.onChange(value.map((id: number) => ({ id })))}
                                    value={field.value?.map((c: any) => c.id)}
                                />
                            )}
                        />
                    </Form.Item>
                </Card>
                <Card title={t('pricing')} bordered={false} style={{ marginTop: 24 }}>
                    <Form.Item label={t('regularPrice')} validateStatus={errors.regular_price ? 'error' : ''} help={errors.regular_price?.message}>
                        <Controller
                            name="regular_price"
                            control={control}
                            render={({ field }) => <Input {...field} prefix="$" />}
                        />
                    </Form.Item>
                    <Form.Item label={t('salePrice')}>
                        <Controller
                            name="sale_price"
                            control={control}
                            render={({ field }) => <Input {...field} prefix="$" />}
                        />
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};
