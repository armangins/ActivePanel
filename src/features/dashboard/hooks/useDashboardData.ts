import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../api/dashboard.service';
import { useSettings } from '@/features/settings';
import { DashboardData } from '../types';
import { useSocket } from '@/contexts/SocketContext';

export const useDashboardData = () => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log('⚡ [Dashboard] Realtime update received, refreshing data...');
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] });
        };

        // Listen for relevant events
        socket.on('order.created', handleUpdate);
        socket.on('order.updated', handleUpdate);
        socket.on('product.created', handleUpdate);
        socket.on('product.updated', handleUpdate);
        socket.on('product.deleted', handleUpdate);
        socket.on('customer.created', handleUpdate);

        return () => {
            socket.off('order.created', handleUpdate);
            socket.off('order.updated', handleUpdate);
            socket.off('product.created', handleUpdate);
            socket.off('product.updated', handleUpdate);
            socket.off('product.deleted', handleUpdate);
            socket.off('customer.created', handleUpdate);
        };
    }, [socket, queryClient]);

    return useQuery<DashboardData>({
        queryKey: ['dashboard', 'data'],
        queryFn: () => dashboardService.getDashboardData(),
        enabled: isConfigured,
        staleTime: 5 * 60 * 1000, // Keep 5m stale time, socket will force refresh
    });
};
