import React from 'react';
import { Card, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageUpload } from '../ProductForm/ImageUpload'; // Reuse existing upload component
import { ProductFormValues } from '../../types/schemas';

interface DetailsMediaProps {
    control: Control<ProductFormValues>;
}

export const DetailsMedia: React.FC<DetailsMediaProps> = ({ control }) => {
    const { t } = useLanguage();

    return (
        <Card title={t('media') || 'Media'} variant="borderless" className="details-card">
            <Form.Item>
                <Controller
                    name="images"
                    control={control}
                    render={({ field }) => (
                        <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </Form.Item>
        </Card>
    );
};
