import { useState } from 'react';
import { Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useVariationsData, useDeleteVariation } from '../hooks/useVariationsData';
import { VariationsList } from './VariationsList';
import { VariationForm } from './VariationForm';
import { Variation } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

interface VariationManagerProps {
    productId: number;
    attributes: any[]; // Product attributes structure
}

export const VariationManager = ({ productId, attributes }: VariationManagerProps) => {
    const { t, isRTL } = useLanguage();
    const { data: variations = [], isLoading } = useVariationsData(productId);
    const deleteMutation = useDeleteVariation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVariation, setEditingVariation] = useState<Variation | null>(null);

    const handleAdd = () => {
        setEditingVariation(null);
        setIsFormOpen(true);
    };

    const handleEdit = (variation: Variation) => {
        setEditingVariation(variation);
        setIsFormOpen(true);
    };

    const handleDelete = (variation: Variation) => {
        if (window.confirm(t('deleteVariationConfirm') || 'Delete this variation?')) {
            deleteMutation.mutate({ productId, variationId: variation.id });
        }
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingVariation(null);
    };

    return (
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3>{t('variations') || 'Variations'} ({variations.length})</h3>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    disabled={!attributes.length}
                >
                    {t('addVariation') || 'Add Variation'}
                </Button>
            </div>

            <VariationsList
                variations={variations}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                title={editingVariation ? (t('editVariation') || 'Edit Variation') : (t('addVariation') || 'Add Variation')}
                open={isFormOpen}
                onCancel={() => setIsFormOpen(false)}
                footer={null}
                width={600}
                destroyOnClose
            >
                <VariationForm
                    productId={productId}
                    variation={editingVariation}
                    attributes={attributes}
                    onCancel={() => setIsFormOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            </Modal>
        </div>
    );
};
