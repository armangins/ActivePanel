import React from 'react';

const StatusBadge = ({ status, t }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'text-primary-500';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-orange-100 text-orange-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'processing') {
            return { backgroundColor: '#EBF3FF' };
        }
        return {};
    };

    return (
        <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}
            style={getStatusStyle(status)}
        >
            {t(status) || status}
        </span>
    );
};

export default StatusBadge;
