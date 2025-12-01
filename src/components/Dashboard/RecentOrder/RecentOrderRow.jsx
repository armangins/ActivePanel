import React from 'react';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

const RecentOrderRow = ({ order, formatCurrency, t }) => {
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-sm text-gray-900 text-right">
                #{order.id}
            </td>
            <td className="py-3 px-4 text-sm text-gray-700 text-right">
                {order.billing?.first_name || ''} {order.billing?.last_name || ''}
                {!order.billing?.first_name && !order.billing?.last_name && (
                    <span className="text-gray-400">{t('guest') || 'Guest'}</span>
                )}
            </td>
            <td className="py-3 px-4 text-sm text-gray-700 text-right">
                {format(new Date(order.date_created), 'dd/MM/yyyy')}
            </td>
            <td className="py-3 px-4">
                <StatusBadge status={order.status} t={t} />
            </td>
            <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                {formatCurrency(parseFloat(order.total || 0))}
            </td>
        </tr>
    );
};

export default RecentOrderRow;
