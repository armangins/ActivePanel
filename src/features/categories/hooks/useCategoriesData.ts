import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../api/categories.service';
import { CreateCategoryData, UpdateCategoryData } from '../types';
import { message } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

export const useCategoriesData = (params: any = {}) => {
    return useQuery({
        queryKey: ['categories', params],
        queryFn: () => categoriesService.getCategories({
            ...params,
            _t: Date.now() // Cache buster
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCategoriesList = () => {
    return useQuery({
        queryKey: ['categories', 'all'],
        queryFn: () => categoriesService.getCategories({ per_page: 100 }),
        staleTime: 5 * 60 * 1000,
    });
}

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (data: CreateCategoryData) => categoriesService.createCategory(data),
        onSuccess: () => {
            message.success(t('categoryCreated') || 'Category created successfully');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
            console.error('Create Category Error:', error);
            let errorMessage = t('errorCreatingCategory') || 'Failed to create category';

            if (error?.response?.data) {
                const data = error.response.data;
                if (data.message) errorMessage += `: ${data.message}`;
                if (data.code === 'term_exists') errorMessage += ` (${t('categoryExists') || 'Already exists'})`;
            } else if (error instanceof Error) {
                errorMessage += `: ${error.message}`;
            }

            message.error(errorMessage);
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCategoryData }) =>
            categoriesService.updateCategory({ id, data }),
        onSuccess: () => {
            message.success(t('categoryUpdated') || 'Category updated successfully');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
            message.error(error.message || t('errorUpdatingCategory') || 'Failed to update category');
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (id: number) => categoriesService.deleteCategory(id),
        onSuccess: () => {
            message.success(t('categoryDeleted') || 'Category deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
            message.error(error.message || t('errorDeletingCategory') || 'Failed to delete category');
        }
    });
};
