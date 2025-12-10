import React from 'react';
import * as Icons from './icons';

/**
 * DynamicIcon Component
 * Renders an icon based on the provided name.
 * 
 * @param {string} name - The name of the icon component (e.g., 'DashboardIcon', 'SettingsIcon')
 * @param {object} props - Props to pass to the icon component
 */
const DynamicIcon = ({ name, ...props }) => {
    const IconComponent = Icons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in DynamicIcon registry.`);
        return null;
    }

    return <IconComponent {...props} />;
};

export default DynamicIcon;
