import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

export const useProductPricing = (onDiscountSelect, onDiscountClear) => {
    const { setValue, watch } = useFormContext();
    const formData = watch();

    const handleFieldChange = useCallback((field, value) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);

    const calculateSalePrice = useCallback((regularPrice, discountPercent) => {
        const price = parseFloat(regularPrice);
        const discount = parseFloat(discountPercent);

        if (!isNaN(price) && price > 0 && !isNaN(discount)) {
            return (price * (1 - discount / 100)).toFixed(2);
        }
        return '';
    }, []);

    const handleRegularPriceChange = useCallback((value, selectedDiscount) => {
        handleFieldChange('regular_price', value);

        // Recalculate sale price if discount is selected
        if (selectedDiscount && value) {
            const salePrice = calculateSalePrice(value, selectedDiscount);
            if (salePrice) {
                handleFieldChange('sale_price', salePrice);
            }
        }
    }, [handleFieldChange, calculateSalePrice]);

    const handleDiscountSelect = useCallback((discount) => {
        onDiscountSelect?.(discount);

        if (formData.regular_price) {
            const salePrice = calculateSalePrice(formData.regular_price, discount);
            if (salePrice) {
                handleFieldChange('sale_price', salePrice);
            }
        }
    }, [onDiscountSelect, formData.regular_price, calculateSalePrice, handleFieldChange]);

    const handleDiscountClear = useCallback(() => {
        onDiscountClear?.();
        handleFieldChange('sale_price', '');
    }, [onDiscountClear, handleFieldChange]);

    return {
        handleFieldChange,
        handleRegularPriceChange,
        handleDiscountSelect,
        handleDiscountClear
    };
};
