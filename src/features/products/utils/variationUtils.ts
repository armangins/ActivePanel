export interface NewVariationData {
    attributes: { id: number | string; name: string; option: string; display_option?: string }[];
    name?: string;
    sku?: string;
    regular_price: string;
    sale_price?: string;
    manage_stock: boolean;
    stock_quantity?: number;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    image?: any;
}

export interface AttributeToCombine {
    id: number | string;
    name: string;
    values: string[];
}

export const generateCombinations = (attrs: AttributeToCombine[], index = 0): { id: number | string, name: string, option: string }[][] => {
    if (index === attrs.length) return [[]];

    const currentAttr = attrs[index];
    const recursiveCombinations = generateCombinations(attrs, index + 1);
    const combinations: { id: number | string, name: string, option: string }[][] = [];

    currentAttr.values.forEach(val => {
        recursiveCombinations.forEach(suffix => {
            combinations.push([{
                id: currentAttr.id,
                name: currentAttr.name,
                option: val
            }, ...suffix]);
        });
    });

    return combinations;
};

export const calculateTotalCombinations = (activeAttributeIds: (number | string)[], wizardAttributes: Record<number | string, string[]>): number => {
    return activeAttributeIds.reduce<number>((acc, id) => {
        const count = wizardAttributes[id]?.length || 0;
        return count === 0 ? acc : acc * count;
    }, activeAttributeIds.length > 0 ? 1 : 0);
};

export const getCombinationSignature = (attributes: { name: string; option: string }[]): string => {
    return attributes
        .map(a => `${a.name}:${a.option}`)
        .sort()
        .join('|');
};
