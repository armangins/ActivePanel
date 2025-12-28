import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '../types/schemas';
import { useCreateProduct, useUpdateProduct, useProductDetail, useVariations } from './useProductsData';
import { useUpdateVariableProduct } from './useUpdateVariableProduct';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@/contexts/MessageContext';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { useLanguage } from '@/contexts/LanguageContext';

export const useProductForm = (productId?: number | null) => {
    const { t } = useLanguage();
    const message = useMessage();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(!!productId);

    // Fetch product if in edit mode
    const { data: product, isLoading: isLoadingProduct } = useProductDetail(productId || null);

    // Fetch variations if in edit mode
    const { data: variations = [], isLoading: isLoadingVariations } = useVariations(productId || 0);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        mode: 'onChange',
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
            stock_quantity: 0,
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
                categories: product.categories?.map((c: any) => ({ id: c.id })) || [],
                images: product.images || [],
                attributes: product.attributes || [],
                virtual: product.virtual,
                downloadable: product.downloadable,
                weight: product.weight,
                dimensions: product.dimensions,
                variations: variations || [] // Populate fetched variations
            });
            setIsEditMode(true);
        }
    }, [product, variations, form]);

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    // New hook for robust variable product updates
    const { updateVariableProduct } = useUpdateVariableProduct({
        updateProgress: (progress) => console.log('Update Progress:', progress)
    });

    const [isVariableUpdating, setIsVariableUpdating] = useState(false);

    const onSubmit = async (data: Partial<ProductFormValues>) => {
        try {
            if (isEditMode && productId) {
                if (data.type === 'variable') {
                    // Use new sync logic for variable products
                    setIsVariableUpdating(true);
                    try {
                        // We need to pass the FULL form data as ProductFormValues
                        // We also pass the originally fetched variations to detect deletes
                        const result = await updateVariableProduct(productId, data as ProductFormValues, variations);

                        if (result.success) {
                            message.success(t('productUpdatedSuccessfully'));
                            return true;
                        } else {
                            throw new Error(result.error);
                        }
                    } finally {
                        setIsVariableUpdating(false);
                    }
                } else {
                    // Simple update for non-variable products
                    await updateMutation.mutateAsync({ id: productId, data });
                    message.success(t('productUpdatedSuccessfully'));
                    return true;
                }
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
            setIsVariableUpdating(false); // Ensure state reset on error
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
        isSaving: createMutation.isPending || updateMutation.isPending || isVariableUpdating,
        onSubmit,
        isEditMode,
        handleGenerateSKU
    };
};
