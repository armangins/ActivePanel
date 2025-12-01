import React from 'react';

const RecentOrdersHead = ({ t }) => {
    return (
        <thead>
            <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    {t('order')} ID
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    {t('customer')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    {t('date')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    {t('status')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    {t('total')}
                </th>
            </tr>
        </thead>
    );
};

export default RecentOrdersHead;
