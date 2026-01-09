import React, { useState } from 'react';
import { Card, Form, Select, Input, Divider, Space, Button, message } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { useCategoriesList, useCreateCategory } from '../../../categories/hooks/useCategoriesData';

interface DetailsOrganizationProps {
    control: Control<ProductFormValues>;
}

export const DetailsOrganization: React.FC<DetailsOrganizationProps> = ({ control }) => {
    const { t } = useLanguage();
    const { data: categoriesData, isLoading } = useCategoriesList();
    const createCategoryMutation = useCreateCategory();
    const [newCategoryName, setNewCategoryName] = useState('');

    // Fallback to empty array if data not loaded yet
    const categories = categoriesData || [];

    const addItem = (field: any) => {
        if (!newCategoryName) return;

        createCategoryMutation.mutate({ name: newCategoryName }, {
            onSuccess: (newCategory: any) => {
                // Add to current selection
                const currentValues = Array.isArray(field.value) ? [...field.value] : [];
                // Use ID from the created category
                const newValue = { id: newCategory.id };

                // Check if already selected (by id)
                if (!currentValues.some((v: any) => v.id === newCategory.id)) {
                    field.onChange([...currentValues, newValue]);
                }

                setNewCategoryName('');
            }
        });
    };

    return (
        <Card title="קטגוריות וסוג מוצר" variant="borderless" className="details-card">
            <Form.Item label={t('categories')}>
                <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            mode="multiple"
                            placeholder={t('selectCategories')}
                            loading={isLoading}
                            options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                            onChange={(value) => field.onChange(value.map((id: number) => ({ id })))}
                            value={Array.isArray(field.value) ? field.value.map((c: any) => c.id) : []}
                            popupRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Space style={{ padding: '0 8px 4px' }}>
                                        <Input
                                            placeholder="שם הקטגוריה"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <Button type="text" htmlType="button" icon={<PlusOutlined />} onClick={(e) => { e.preventDefault(); addItem(field); }} loading={createCategoryMutation.isPending}>
                                            הוספה
                                        </Button>
                                    </Space>
                                </>
                            )}
                        />
                    )}
                />
            </Form.Item>

            <Form.Item label="סוג המוצר">
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} style={{ width: '100%' }}>
                            <Select.Option value="simple">{t('simpleProduct')}</Select.Option>
                            <Select.Option value="variable">{t('variableProduct')}</Select.Option>
                        </Select>
                    )}
                />
            </Form.Item>
        </Card>
    );
};
