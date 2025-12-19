import { useQuery } from '@tanstack/react-query';
import { attributesAPI } from '../services/woocommerce';
import { useWooCommerceSettings } from './useWooCommerceSettings';

export const useAttributes = () => {
    const { hasSettings } = useWooCommerceSettings();

    return useQuery({
        queryKey: ['attributes'],
        queryFn: () => attributesAPI.getAll(),
        enabled: hasSettings,
        staleTime: 60 * 1000 * 5, // 5 minutes
    });
};
