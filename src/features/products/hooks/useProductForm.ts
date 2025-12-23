import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '../types/schemas';
import { useCreateProduct, useUpdateProduct, useProductDetail } from './useProductsData';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { useLanguage } from '@/contexts/LanguageContext';

export const useProductForm = (productId?: number | null) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(!!productId);

    // Fetch product if in edit mode
    const { data: product, isLoading: isLoadingProduct } = useProductDetail(productId || null);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        mode: 'onChange', // Validate on change for real-time feedback
        defaultValues: {
            name: '',
            type: 'simple',
            status: 'publish',
            regular_price: '',
            sale_price: '',
            date_on_sale_from: null,
            date_on_sale_to: null,
            manage_stock: true,
            stock_status: 'instock',
            categories: [], // IDs
            images: [],
            attributes: [],
            variations: [],
            virtual: false,
            downloadable: false
        }
    });

    // Populate form when product data loads
    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                type: product.type,
                status: product.status,
                description: product.description,
                short_description: product.short_description,
                sku: product.sku,
                regular_price: product.regular_price,
                sale_price: product.sale_price,
                manage_stock: product.manage_stock,
                stock_status: product.stock_status,
                stock_quantity: product.stock_quantity,
                categories: product.categories?.map(c => ({ id: c.id })) || [],
                images: product.images || [],
                attributes: product.attributes || [],
                virtual: product.virtual,
                downloadable: product.downloadable,
                weight: product.weight,
                dimensions: product.dimensions
            });
            setIsEditMode(true);
        }
    }, [product, form]);

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    const onSubmit = async (data: Partial<ProductFormValues>) => {
        try {
            if (isEditMode && productId) {
                // Determine if this is a full update or partial (like status change)
                await updateMutation.mutateAsync({ id: productId, data });
                message.success(t('productUpdatedSuccessfully'));
                return true;
            } else {
                // Create mode
                const response = await createMutation.mutateAsync(data as any);
                message.success(t('productCreatedSuccessfully'));

                // If specific status was requested (like 'draft'), we don't redirect yet
                if (data.status === 'draft') {
                    // Force navigation to edit mode of the new draft
                    navigate(`/products/edit/${response.id}`, { replace: true });
                    return true;
                }

                navigate('/products');
                return true;
            }
        } catch (error: any) {
            secureLog.error('Product form submission error:', error);
            message.error(error.message || t('errorSavingProduct'));
            return false;
        }
    };

    const handleGenerateSKU = () => {
        const name = form.getValues('name');
        if (!name) return;

        // Simple SKU generation logic
        const sku = name
            .trim()
            .toUpperCase()
            .substring(0, 3) + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

        form.setValue('sku', sku, { shouldDirty: true });
    };

    return {
        form,
        isLoading: isLoadingProduct,
        isSaving: createMutation.isPending || updateMutation.isPending,
        onSubmit: onSubmit, // Expose the wrapped submit handler
        isEditMode,
        handleGenerateSKU
    };
};
