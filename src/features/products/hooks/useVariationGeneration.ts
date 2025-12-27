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

    const getVariations = (existingVariations: any[] = []) => {
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

            // Try to find an existing variation that matches these attributes
            const match = existingVariations.find((existing: any) => {
                if (!existing.attributes || existing.attributes.length !== attributes.length) return false;

                // Case-insensitive comparison helper
                const normalize = (str: any) => String(str).toLowerCase().trim();

                return attributes.every((cA: any) =>
                    existing.attributes.some((eA: any) =>
                        normalize(eA.name) === normalize(cA.name) &&
                        normalize(eA.option) === normalize(cA.option)
                    )
                );
            });

            if (match) {
                // Preserve identity and key data
                return {
                    ...match,
                    attributes // Update attributes structure just in case, but keep values
                };
            }

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
        const existingVariations = getValues('variations') || [];
        // Pass existing so we can preserve IDs if we "generate" something that actually exists
        // (Though logic below filters uniqueNew, this helps if logic changes)
        const newCandidates = getVariations(existingVariations);

        // Filter out candidates that truly match existing ones (by ID or attributes)
        const uniqueNew = newCandidates.filter(candidate => {
            // If it has an ID, it's definitely existing, so skip it (we only want NEW ones here)
            if (candidate.id && candidate.id !== 0) return false;

            // Double check attribute matching for good measure
            const exists = existingVariations.some((existing: any) => {
                if (!existing.attributes || existing.attributes.length !== candidate.attributes.length) return false;

                const normalize = (str: any) => String(str).toLowerCase().trim();

                return candidate.attributes.every((cA: any) =>
                    existing.attributes.some((eA: any) =>
                        normalize(eA.name) === normalize(cA.name) &&
                        normalize(eA.option) === normalize(cA.option)
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
     * Destructive Regeneration: Rebuilds list but preserves IDs of matches
     */
    const regenerateVariations = useCallback(() => {
        const existingVariations = getValues('variations') || [];
        const allFresh = getVariations(existingVariations);
        // Replace entire array with fresh list (some of which might have preserved IDs)
        setValue('variations', allFresh, { shouldDirty: true });
    }, [currentAttributes, parentRegularPrice, parentSalePrice, setValue, getValues]);

    return { generateVariations, regenerateVariations };
};
