export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * STRICT VALIDATION for Variation Data Integrity.
 * 
 * Rules:
 * 1. **Allow "Any"**: Empty option strings are PERMITTED. They represent "Any".
 * 2. **Prevent Leaks (Extra Attributes)**: Variation MUST NOT contain attributes that are not defined as `variation: true` in the Parent.
 * 3. **Ensure Completeness**: Variation MUST have an entry for EVERY `variation: true` attribute in the Parent.
 * 4. **Strict Option Match**: If an option is provided (not empty), it MUST exist in the Parent's allowed options.
 */
export const validatePreFlightVariations = (
    variations: any[],
    parentAttributes: any[]
): ValidationResult => {
    const errors: string[] = [];

    // 1. Identify valid parent variation attributes
    // Only attributes marked `variation: true` are relevant.
    const validParentVariationAttrs = parentAttributes.filter(a => a.variation);
    const validAttrNames = new Set(validParentVariationAttrs.map(a => a.name));

    if (validParentVariationAttrs.length === 0) {
        console.warn('⚠️ [Validation] No valid parent attributes found for variation! This is likely an error.');
    } else {
        console.log('🛡️ [Validation] Valid Parent Variation Attributes:', validParentVariationAttrs.map(a => a.name));
    }

    // Map: Attribute Name -> Set of Allowed Options (Slugs)
    const allowedOptionsMap = new Map<string, Set<string>>();
    validParentVariationAttrs.forEach(attr => {
        const options = (attr.options || []) as string[];
        const optionsSet = new Set(options.map(opt => String(opt)));
        allowedOptionsMap.set(attr.name, optionsSet);
    });

    variations.forEach((variation, index) => {
        if (!variation.attributes || !Array.isArray(variation.attributes)) {
            errors.push(`Variation #${index + 1}: Missing attributes data.`);
            return;
        }

        const variationAttrs = variation.attributes;
        const variationAttrNames = new Set(variationAttrs.map((a: any) => a.name));

        // CHECK 1: Completeness (Prevent "First Term Only" bug)
        // Ensure every parent variation attribute is present in this variation
        validParentVariationAttrs.forEach(parentAttr => {
            if (!variationAttrNames.has(parentAttr.name)) {
                errors.push(`Variation #${index + 1}: Missing entry for attribute "${parentAttr.name}".`);
            }
        });

        // CHECK 2: Prevent Leaks (Extra Attributes)
        // Ensure the variation doesn't have attributes NOT in the parent's variation list
        variationAttrs.forEach((attr: any) => {
            if (!validAttrNames.has(attr.name)) {
                errors.push(`Variation #${index + 1}: Contains extra/invalid attribute "${attr.name}". Only parent variation attributes are allowed.`);
            }

            // CHECK 3: Strict Option Match (if not "Any")
            const allowedOptions = allowedOptionsMap.get(attr.name);
            if (attr.option && attr.option !== '') {
                // If value is provided, it MUST be valid
                if (allowedOptions && !allowedOptions.has(attr.option)) {
                    errors.push(`Variation #${index + 1}: Invalid value "${attr.option}" for attribute "${attr.name}". It does not match parent configuration.`);
                }
            }
            // If attr.option is "" (empty), it implies "Any", which is ALLOWED.
        });
    });



    if (errors.length > 0) {
        console.error('❌ [Validation] Pre-Flight Failed with Errors:', errors);
    } else {
        console.log('✅ [Validation] Pre-Flight Passed. All variations match parent structure.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
