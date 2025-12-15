import React from 'react';
import { secureLog } from '../utils/logger';
import * as AntIcons from '@ant-design/icons';

/**
 * DynamicIcon Component
 * Renders an Ant Design icon based on the provided name.
 * 
 * @deprecated This component is deprecated. Use Ant Design icons directly instead.
 * @param {string} name - The name of the Ant Design icon component (e.g., 'DashboardOutlined', 'SettingOutlined')
 * @param {object} props - Props to pass to the icon component
 */
const DynamicIcon = ({ name, ...props }) => {
    const IconComponent = AntIcons[name];

    if (!IconComponent) {
        secureLog.warn(`Icon "${name}" not found in Ant Design icons.`);
        return null;
    }

    return React.createElement(IconComponent, props);
};

export default DynamicIcon;
