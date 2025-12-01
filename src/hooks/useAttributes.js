import { useQuery } from '@tanstack/react-query';
import { attributesAPI } from '../services/woocommerce';

// Query keys
export const attributeKeys = {
    all: ['attributes'],
    terms: (attributeId) => [...attributeKeys.all, attributeId, 'terms'],
};

// Fetch all attributes
export const useAttributesData = () => {
    return useQuery({
        queryKey: attributeKeys.all,
        queryFn: () => attributesAPI.getAll(),
        staleTime: Infinity, // Attributes rarely change
    });
};

// Fetch terms for an attribute
export const useAttributeTerms = (attributeId) => {
    return useQuery({
        queryKey: attributeKeys.terms(attributeId),
        queryFn: () => attributesAPI.getTerms(attributeId),
        staleTime: Infinity, // Terms rarely change
        enabled: !!attributeId,
    });
};
