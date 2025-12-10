import React from 'react';
import {
    ExclamationCircleIcon,
    CubeIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../cards/Card';

/**
 * StatusMessage Component
 * 
 * A reusable, centered component for displaying status messages (errors, empty states, success).
 * 
 * @param {string} type - 'error', 'empty', 'success', 'info'
 * @param {string} title - Main title text
 * @param {string} message - Description text
 * @param {React.Component} icon - Custom icon component (optional)
 * @param {React.ReactNode} action - Action button/element (optional)
 * @param {boolean} fullPage - Whether to center on the full page
 */
const StatusMessage = ({
    type = 'info',
    title,
    message,
    icon: CustomIcon,
    action,
    fullPage = false
}) => {

    // Configuration based on type
    const config = {
        error: {
            icon: ExclamationCircleIcon,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100'
        },
        empty: {
            icon: CubeIcon,
            color: 'text-gray-400',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-100'
        },
        success: {
            icon: CheckCircleIcon,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100'
        },
        info: {
            icon: InformationCircleIcon,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100'
        }
    };

    const currentConfig = config[type] || config.info;
    const Icon = CustomIcon || currentConfig.icon;

    const content = (
        <Card className="h-full flex flex-col justify-center">
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                <div className={`p-4 rounded-full ${currentConfig.bgColor} mb-6`}>
                    <Icon className={`w-12 h-12 ${currentConfig.color}`} />
                </div>

                {title && (
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {title}
                    </h3>
                )}

                {message && (
                    <div className="text-lg text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                        {message}
                    </div>
                )}

                {action && (
                    <div className="mt-2">
                        {action}
                    </div>
                )}
            </div>
        </Card>
    );

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-6">
                <div className="w-full max-w-lg">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

export default StatusMessage;
