import { useState } from 'react';
import { useDeleteProduct } from '../../../hooks/useProducts';

/**
 * Custom hook to handle product deletion with confirmation
 */
export const useProductDelete = (allProducts, selectedProduct, setIsDetailsOpen, setSelectedProduct, t) => {
    const deleteMutation = useDeleteProduct();

    const handleDelete = async (id) => {
        // Security: Add confirmation dialog before destructive action
        const product = allProducts.find(p => p.id === id);
        const productName = product?.name || 'this product';

        if (!window.confirm(`${t('confirmDelete') || 'Are you sure you want to delete'} "${productName}"? ${t('cannotUndo') || 'This action cannot be undone.'}`)) {
            return;
        }

        if (selectedProduct?.id === id) {
            setIsDetailsOpen(false);
            setSelectedProduct(null);
        }

        try {
            await deleteMutation.mutateAsync(id);
            // Success - mutation will automatically invalidate and refetch
        } catch (err) {
            // Error handling - could integrate with toast notification system
            console.error('Delete error:', err);
            const errorMessage = err.message || t('error') || 'An error occurred';
            // TODO: Replace with toast notification for better UX
            alert(`${t('error') || 'Error'}: ${errorMessage}`);
        }
    };

    return { handleDelete, isDeleting: deleteMutation.isLoading };
};
