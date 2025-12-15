import React from 'react';
import { Result, Card } from 'antd';
import {
    ExclamationCircleOutlined,
    InboxOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

/**
 * StatusMessage Component - Ant Design wrapper
 * 
 * A reusable, centered component for displaying status messages using Ant Design Result.
 */
const StatusMessage = ({
    type = 'info',
    title,
    message,
    icon: CustomIcon,
    action,
    fullPage = false
}) => {
    // Map types to Ant Design Result status
    const statusMap = {
        error: 'error',
        empty: 'info',
        success: 'success',
        info: 'info',
    };

    // Default icons
    const defaultIcons = {
        error: <ExclamationCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />,
        empty: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
        success: <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />,
        info: <InfoCircleOutlined style={{ fontSize: 64, color: '#1890ff' }} />,
    };

    const status = statusMap[type] || 'info';
    // Handle icon - ensure it's always a React element
    let iconElement = defaultIcons[type];
    if (CustomIcon) {
        if (React.isValidElement(CustomIcon)) {
            iconElement = CustomIcon;
        } else if (typeof CustomIcon === 'function') {
            iconElement = <CustomIcon />;
        }
    }

    // Handle action - ensure it's always a valid React element or array
    // Ant Design Result's extra prop accepts ReactNode (element, array, or null)
    let actionElement = null;
    if (action !== null && action !== undefined) {
        if (React.isValidElement(action)) {
            actionElement = action;
        } else if (Array.isArray(action)) {
            // Filter out invalid elements
            const validActions = action.filter(item => React.isValidElement(item));
            actionElement = validActions.length > 0 ? validActions : null;
        } else if (typeof action === 'function' && action.prototype && action.prototype.render) {
            // It's a class component
            const ActionComponent = action;
            actionElement = <ActionComponent />;
        } else if (typeof action === 'function') {
            // It's a function component
            const ActionComponent = action;
            actionElement = <ActionComponent />;
        }
    }

    const content = (
        <Result
            status={status}
            icon={iconElement}
            title={title}
            subTitle={message}
            extra={actionElement || undefined}
        />
    );

    if (fullPage) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh', 
                padding: '24px' 
            }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    {content}
                </div>
            </div>
        );
    }

    return (
        <Card>
            {content}
        </Card>
    );
};

export default StatusMessage;
