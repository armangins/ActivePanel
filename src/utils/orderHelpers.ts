/**
 * Order Helper Utilities
 * 
 * Utility functions for working with order data.
 */

interface Billing {
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface Customer {
    email?: string;
}

interface Order {
    billing?: Billing;
    customer?: Customer;
    id?: number | string;
    [key: string]: any;
}

/**
 * Get customer name from order object
 * @param order - Order object
 * @param t - Translation function (optional)
 * @returns Customer name or fallback text
 */
export const getCustomerName = (
    order: Order,
    t?: (key: string) => string
): string => {
    if (order.billing?.first_name || order.billing?.last_name) {
        return `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim();
    }
    return order.billing?.email || order.customer?.email || (t?.('customer') || 'לקוח');
};
