import { z } from 'zod';

export interface DashboardStats {
    totalRevenue: string; // Formatted string or raw number string? Based on legacy useDashboardStats it returns string fixed to 2 decimals usually.
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
}

export interface SalesChartData {
    month: number;
    monthName: string;
    earnings: number;
}

// We'll treat Order/Product interfaces loosely here or import from their future features if ready. 
// For now, we define what the Dashboard specifically needs.

export interface DashboardOrder {
    id: number;
    total: string;
    status: string;
    date_created: string;
    line_items: any[];
    billing?: {
        first_name: string;
        last_name: string;
    };
    // Add other fields as needed for RecentOrdersWidget
}

export interface DashboardProduct {
    id: number;
    name: string;
    total_sales: number | string;
    price: string;
    stock_status: string;
    stock_quantity: number | null;
    images: any[];
}

export interface DashboardData {
    stats: DashboardStats;
    salesChartData: SalesChartData[];
    recentOrders: DashboardOrder[];
    topProducts: DashboardProduct[];
    lowStockCount: number;
}

export interface DashboardState {
    data: DashboardData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}
