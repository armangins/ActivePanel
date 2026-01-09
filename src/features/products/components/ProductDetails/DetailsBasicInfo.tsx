import React from 'react';
import { Card, Form, Input, Tooltip } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { ProductFormValues } from '../../types/schemas';

interface DetailsBasicInfoProps {
    control: Control<ProductFormValues>;
}

export const DetailsBasicInfo: React.FC<DetailsBasicInfoProps> = ({ control }) => {
    const { t } = useLanguage();

    return (
        <Card title={t('basicInfo') || 'Basic Information'} variant="borderless" className="details-card">
            <Form.Item label={t('productName')} required>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: t('required') }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input {...field} placeholder={t('enterProductName')} status={error ? 'error' : ''} />
                            {error && <div style={{ color: '#ff4d4f', fontSize: 12 }}>{error.message}</div>}
                        </>
                    )}
                />
            </Form.Item>

            <Form.Item
                label={
                    <span>
                        {t('shortDescription')}
                        <Tooltip title={t('shortDescriptionTooltip') === 'shortDescriptionTooltip' ? "תיאור מוצר קצר, כאן כותבים את הטקסט הכללי הקצר על המוצר" : t('shortDescriptionTooltip')}>
                            <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff', cursor: 'help' }} />
                        </Tooltip>
                    </span>
                }
            >
                <Controller
                    name="short_description"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('enterShortDescription')}
                            minHeight={150}
                        />
                    )}
                />
            </Form.Item>

            <Form.Item
                label={
                    <span>
                        {t('description')}
                        <Tooltip title={t('descriptionTooltip') === 'descriptionTooltip' ? "כאן כותבים את התיאור מוצר המורחב, לדוגמה מפרט טכני" : t('descriptionTooltip')}>
                            <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff', cursor: 'help' }} />
                        </Tooltip>
                    </span>
                }
            >
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('enterProductDescription')}
                        />
                    )}
                />
            </Form.Item>
        </Card>
    );
};
