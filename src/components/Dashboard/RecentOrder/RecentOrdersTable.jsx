import React from 'react';
import RecentOrdersHead from './RecentOrdersHead';
import RecentOrderRow from './RecentOrderRow';

/**
 * RecentOrdersTable Component
 * 
 * Displays a table of recent orders with order details.
 * 
 * @param {Array} orders - Array of order objects
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 */
const RecentOrdersTable = ({ orders, formatCurrency, t }) => {
    if (orders.length === 0) {
        return (
            <p className="text-gray-500 text-right py-8">
                {t('noOrders')}
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <RecentOrdersHead t={t} />
                <tbody>
                    {orders.map((order) => (
                        <RecentOrderRow
                            key={order.id}
                            order={order}
                            formatCurrency={formatCurrency}
                            t={t}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrdersTable;
