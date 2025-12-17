
import React from 'react';
import VariationsSection from '../AddProductView/sub-components/VariationsSection/VariationsSection';

/**
 * ProductDetailsVariations Component
 * Wrapper for VariationsSection to be used in ProductDetailsModal (Read-Only)
 */
const ProductDetailsVariations = ({
    variations = [],
    loading = false,
    t,
    isRTL,
    formatCurrency
}) => {
    return (
        <VariationsSection
            variations={variations}
            pendingVariations={[]} // No pending variations in details view
            loading={loading}
            isEditMode={false}
            formatCurrency={formatCurrency}
            isRTL={isRTL}
            t={t}
        // Omitting onAddClick, onDeletePending, onDeleteVariation to ensure read-only mode
        />
    );
};

export default ProductDetailsVariations;

