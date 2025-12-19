import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormSchema } from '../types/schemas';
import { Category } from '../types';
import { useCreateCategory, useUpdateCategory } from './useCategoriesData';

export const useCategoryForm = (category?: Category | null, onClose?: () => void) => {
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const form = useForm<CategoryFormSchema>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: '',
            slug: '',
            parent: 0,
            description: '',
            display: 'default'
        }
    });

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                slug: category.slug,
                parent: category.parent,
                description: category.description,
                display: category.display || 'default'
            });
        } else {
            form.reset({
                name: '',
                slug: '',
                parent: 0,
                description: '',
                display: 'default'
            });
        }
    }, [category, form]);

    const onSubmit = async (data: CategoryFormSchema) => {
        try {
            if (category?.id) {
                await updateMutation.mutateAsync({ id: category.id, data: { ...data, id: category.id } });
            } else {
                await createMutation.mutateAsync(data);
            }
            onClose?.();
        } catch (error) {
            console.error('Failed to save category', error);
        }
    };

    return {
        form,
        isLoading: createMutation.isPending || updateMutation.isPending,
        onSubmit: form.handleSubmit(onSubmit),
        isEditMode: !!category
    };
};
