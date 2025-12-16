/**
 * Variation Utilities
 * 
 * Helper functions for managing product variations
 */

/**
 * Generate all possible combinations of attributes (Cartesian Product)
 * 
 * @param {Array} attributes - List of available attributes
 * @param {Object} selectedAttributeTerms - Map of selected terms { attributeId: [termIds] }
 * @param {Object} attributeTerms - Map of all terms { attributeId: [terms] }
 * @returns {Array} Array of combination objects: { attributes: { attrId: termId } }
 */
export const generateCombinations = (attributes, selectedAttributeTerms, attributeTerms) => {
    // Filter attributes that have at least one term selected
    const activeAttributes = attributes.filter(attr =>
        selectedAttributeTerms[attr.id] && selectedAttributeTerms[attr.id].length > 0
    );

    if (activeAttributes.length === 0) {
        return [];
    }

    // Helper to compute Cartesian product of arrays
    const cartesian = (arrays) => {
        return arrays.reduce((acc, curr) => {
            return acc.flatMap(a => curr.map(c => [...a, c]));
        }, [[]]);
    };

    // Prepare input arrays for Cartesian product
    // Each element is an array objects: { id: attrId, termId: termId }
    const attributeInputs = activeAttributes.map(attr => {
        const selectedTermIds = selectedAttributeTerms[attr.id];
        return selectedTermIds.map(termId => ({
            attributeId: attr.id,
            termId: termId
        }));
    });

    // Generate all combinations
    const combinations = cartesian(attributeInputs);

    // Format result
    return combinations.map(combo => {
        const attributeMap = {};
        combo.forEach(item => {
            attributeMap[item.attributeId] = item.termId;
        });
        return {
            attributes: attributeMap
        };
    });
};
