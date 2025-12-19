import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/dashboard.service';
import { useSettings } from '@/features/settings';
import { DashboardData } from '../types';

export const useDashboardData = () => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<DashboardData>({
        queryKey: ['dashboard', 'data'],
        queryFn: () => dashboardService.getDashboardData(),
        enabled: isConfigured,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
