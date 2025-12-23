import { useCallback } from 'react';
import { UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { ProductFormValues } from '../types/schemas';

interface UseVariationGenerationProps {
    currentAttributes: any[];
    parentRegularPrice: string;
    parentSalePrice: string;
    setValue: UseFormSetValue<ProductFormValues>;
    getValues: UseFormGetValues<ProductFormValues>;
}

/**
 * Hook for generating product variations from attributes
 * Creates all possible combinations using cartesian product
 */
export const useVariationGeneration = ({
    currentAttributes,
    parentRegularPrice,
    parentSalePrice,
    setValue,
    getValues
}: UseVariationGenerationProps) => {

    const generateVariations = useCallback(() => {
        // Auto-generate all possible variation combinations
        const attributesWithTerms = currentAttributes.filter((attr: any) =>
            attr.options && attr.options.length > 0
        );

        if (attributesWithTerms.length === 0) {
            return;
        }

        // Generate all combinations using cartesian product
        const generateCombinations = (arrays: string[][]): string[][] => {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const restCombinations = generateCombinations(rest);
            return first.flatMap(item =>
                restCombinations.map(combo => [item, ...combo])
            );
        };

        const termArrays = attributesWithTerms.map((attr: any) => attr.options);
        const combinations = generateCombinations(termArrays);

        // Create variation objects
        const newVariations = combinations.map((combo) => {
            const attributes = combo.map((term, i) => ({
                id: attributesWithTerms[i].id || 0,
                name: attributesWithTerms[i].name,
                option: term
            }));

            return {
                id: 0,
                sku: '',
                regular_price: parentRegularPrice, // Inherit from parent
                sale_price: parentSalePrice, // Inherit from parent
                stock_quantity: 0,
                stock_status: 'instock' as const,
                manage_stock: true, // Enable stock management by default
                attributes
            };
        });

        // Get existing variations and append new ones
        const existingVariations = getValues('variations') || [];
        const allVariations = [...existingVariations, ...newVariations];

        // Set all variations in form
        setValue('variations', allVariations, { shouldDirty: true });
    }, [currentAttributes, parentRegularPrice, parentSalePrice, setValue, getValues]);

    return { generateVariations };
};
