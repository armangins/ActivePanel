import { useState } from 'react';
import { useVariations, useDeleteVariation } from '../../../hooks/useVariations';
import VariationsList from '../VariationsList';
import { Button } from '../../ui';
import { PlusIcon } from '@heroicons/react/24/outline';

/**
 * VariationManager Component
 * 
 * Main component for managing product variations.
 * Handles fetching, displaying, and managing variations for a product.
 * 
 * @param {Number} productId - Product ID
 * @param {String} productType - Product type ('variable', 'simple', etc.)
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {Boolean} showActions - Whether to show edit/delete actions
 * @param {Function} onAddVariation - Callback when "Add Variation" is clicked
 * @param {Function} onEditVariation - Callback when edit is clicked
 */
const VariationManager = ({
    productId,
    productType,
    formatCurrency,
    t,
    showActions = false,
    onAddVariation,
    onEditVariation
}) => {
    const isVariableProduct = productType === 'variable';

    // Fetch variations using React Query hook
    const {
        data: variationsData,
        isLoading,
        error
    } = useVariations(productId, {
        enabled: isVariableProduct && !!productId
    });

    // Delete mutation
    const deleteMutation = useDeleteVariation();

    const variations = variationsData?.data || [];

    // Handle delete with confirmation
    const handleDelete = async (variation) => {
        const attributesText = variation.attributes?.length > 0
            ? variation.attributes.map(attr => `${attr.option}`).join(', ')
            : `#${variation.id}`;

        if (!window.confirm(
            `${t('confirmDelete') || 'Are you sure you want to delete'} "${attributesText}"? ${t('cannotUndo') || 'This action cannot be undone.'}`
        )) {
            return;
        }

        try {
            await deleteMutation.mutateAsync({
                productId,
                variationId: variation.id
            });
        } catch (err) {
            console.error('Delete variation error:', err);
            alert(`${t('error') || 'Error'}: ${err.message || 'Failed to delete variation'}`);
        }
    };

    // If not a variable product, show message
    if (!isVariableProduct) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                    {t('notVariableProduct') || 'This is not a variable product'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Add Button */}
            {showActions && onAddVariation && (
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                        {t('variations') || 'Variations'}
                    </h3>
                    <Button
                        onClick={onAddVariation}
                        size="sm"
                        variant="primary"
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {t('addVariation') || 'Add Variation'}
                    </Button>
                </div>
            )}

            {/* Variations List */}
            <VariationsList
                variations={variations}
                loading={isLoading}
                error={error?.message || null}
                formatCurrency={formatCurrency}
                t={t}
                onEdit={showActions ? onEditVariation : undefined}
                onDelete={showActions ? handleDelete : undefined}
                showActions={showActions}
            />
        </div>
    );
};

export default VariationManager;
