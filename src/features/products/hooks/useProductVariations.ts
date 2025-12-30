import { useState, useEffect } from 'react';
import { productsService } from '../api/products.service';

export const useProductVariations = (product: any) => {
    const [variations, setVariations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product && product.type === 'variable') {
            setLoading(true);
            productsService.getVariations(product.id)
                .then(data => setVariations(data))
                .catch(err => console.error('Failed to fetch variations', err))
                .finally(() => setLoading(false));
        } else {
            setVariations([]);
        }
    }, [product]);

    return { variations, loading };
};
