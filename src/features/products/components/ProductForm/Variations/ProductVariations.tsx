import React from 'react';
import { Typography, Row, Col, Button } from 'antd';
import { Control, useFieldArray, useWatch } from 'react-hook-form';
import { ProductFormValues } from '../../../types/schemas';
import { ProductVariationCard } from './ProductVariationCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProductVariationsProps {
    control: Control<ProductFormValues>;
    parentName?: string; // Parent product name for fallback display
    errors?: any; // Form errors for validation display
    onEdit?: (index: number) => void;
}

export const ProductVariations: React.FC<ProductVariationsProps> = ({ control, parentName, errors, onEdit }) => {
    const { t } = useLanguage();

    const { fields, remove } = useFieldArray({
        control,
        name: 'variations'
    });

    const variations = useWatch({ control, name: 'variations' }) || [];

    // Don't render anything if there are no variations
    if (variations.length === 0) {
        return null;
    }

    return (
        <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>
                    {t('variations')} ({variations.length})
                </Title>
                {variations.length > 0 && (
                    <Button
                        danger
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            // Remove all variations
                            for (let i = variations.length - 1; i >= 0; i--) {
                                remove(i);
                            }
                        }}
                    >
                        {t('deleteAll')}
                    </Button>
                )}
            </div>

            <Row gutter={[16, 16]}>
                {fields.map((field, index) => (
                    <Col key={field.id} xs={24} sm={24} md={12} lg={8}>
                        <ProductVariationCard
                            variation={variations[index]}
                            index={index}
                            control={control}
                            onRemove={() => remove(index)}
                            parentName={parentName}
                            errors={errors}
                            onEdit={onEdit ? () => onEdit(index) : undefined}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    );
};
