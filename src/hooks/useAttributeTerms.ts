import { useQuery } from '@tanstack/react-query';
import { attributesAPI } from '../services/woocommerce';
import { useWooCommerceSettings } from './useWooCommerceSettings';

export const useAttributeTerms = (attributeId: number | null | undefined) => {
    const { hasSettings } = useWooCommerceSettings();

    return useQuery({
        queryKey: ['attribute', attributeId, 'terms'],
        queryFn: () => attributesAPI.getTerms(attributeId!),
        enabled: hasSettings && !!attributeId,
        staleTime: 60 * 1000 * 5, // 5 minutes
    });
};
