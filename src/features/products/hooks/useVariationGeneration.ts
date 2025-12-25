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

    const getVariations = () => {
        const attributesWithTerms = currentAttributes.filter((attr: any) =>
            attr.options && attr.options.length > 0
        );

        if (attributesWithTerms.length === 0) return [];

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
        return combinations.map((combo) => {
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
    };

    /**
     * Additive Generation: Only adds new unique variations
     */
    const generateVariations = useCallback(() => {
        const newCandidates = getVariations();
        const existingVariations = getValues('variations') || [];

        // Filter out candidates that effectively exist already
        const uniqueNew = newCandidates.filter(candidate => {
            // Check if ANY existing variation matches this candidate's attributes
            const exists = existingVariations.some((existing: any) => {
                // If attribute count differs, they differ
                if (!existing.attributes || existing.attributes.length !== candidate.attributes.length) return false;

                // Check if every attribute in candidate exists in existing (Name + Option match)
                // We use Name/Option pair because ID might be 0 for new attrs
                return candidate.attributes.every((cA: any) =>
                    existing.attributes.some((eA: any) =>
                        eA.name === cA.name && eA.option === cA.option
                    )
                );
            });
            return !exists;
        });

        if (uniqueNew.length > 0) {
            const allVariations = [...existingVariations, ...uniqueNew];
            setValue('variations', allVariations, { shouldDirty: true });
        }
    }, [currentAttributes, parentRegularPrice, parentSalePrice, setValue, getValues]);

    /**
     * Destructive Regeneration: Clears and rebuilds all
     */
    const regenerateVariations = useCallback(() => {
        const allFresh = getVariations();
        // Replace entire array
        setValue('variations', allFresh, { shouldDirty: true });
    }, [currentAttributes, parentRegularPrice, parentSalePrice, setValue]);

    return { generateVariations, regenerateVariations };
};
