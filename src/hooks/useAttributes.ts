import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributesAPI } from '../services/woocommerce';
import { useWooCommerceSettings } from './useWooCommerceSettings';
import { message } from 'antd';

export const useAttributes = () => {
    const { hasSettings } = useWooCommerceSettings();

    return useQuery({
        queryKey: ['attributes'],
        queryFn: () => attributesAPI.getAll(),
        enabled: hasSettings,
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true,
    });
};

export const useAttributeTerms = (attributeId: number | undefined) => {
    const { hasSettings } = useWooCommerceSettings();

    return useQuery({
        queryKey: ['attribute-terms', attributeId],
        queryFn: () => attributesAPI.getTerms(attributeId!),
        enabled: hasSettings && !!attributeId && Number.isInteger(attributeId) && attributeId < 2147483647, // Ensure valid int32 ID to avoid fetching local attributes
        staleTime: 60 * 1000 * 5, // 5 minutes
    });
};

export const useCreateAttribute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => attributesAPI.create(data),
        onSuccess: () => {
            message.success('Attribute created successfully');
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
        onError: (error) => {
            message.error('Failed to create attribute');
            console.error(error);
        }
    });
};

export const useUpdateAttribute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: number; data: any }) => attributesAPI.update(data.id, data.data),
        onSuccess: () => {
            message.success('Attribute updated successfully');
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
        onError: (error) => {
            message.error('Failed to update attribute');
            console.error(error);
        }
    });
};

export const useDeleteAttribute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => attributesAPI.delete(id),
        onSuccess: () => {
            message.success('Attribute deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
        onError: (error) => {
            message.error('Failed to delete attribute');
            console.error(error);
        }
    });
};

export const useCreateAttributeTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { attributeId: number; data: any }) =>
            attributesAPI.createTerm(vars.attributeId, vars.data),
        onSuccess: (_, vars) => {
            message.success('Term created successfully');
            queryClient.invalidateQueries({ queryKey: ['attribute-terms', vars.attributeId] });
        },
        onError: (error) => {
            message.error('Failed to create term');
            console.error(error);
        }
    });
};

export const useUpdateAttributeTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { attributeId: number; termId: number; data: any }) =>
            attributesAPI.updateTerm(vars.attributeId, vars.termId, vars.data),
        onSuccess: (_, vars) => {
            message.success('Term updated successfully');
            queryClient.invalidateQueries({ queryKey: ['attribute-terms', vars.attributeId] });
        },
        onError: (error) => {
            message.error('Failed to update term');
            console.error(error);
        }
    });
};

export const useDeleteAttributeTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { attributeId: number; termId: number }) =>
            attributesAPI.deleteTerm(vars.attributeId, vars.termId),
        onSuccess: (_, vars) => {
            message.success('Term deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['attribute-terms', vars.attributeId] });
        },
        onError: (error) => {
            message.error('Failed to delete term');
            console.error(error);
        }
    });
};
