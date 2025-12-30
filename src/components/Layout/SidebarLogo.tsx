import React from 'react';
import { theme } from 'antd';

const { useToken } = theme;

interface SidebarLogoProps {
    isCollapsed: boolean;
    isRTL: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = React.memo(({ isCollapsed }) => {
    const { token } = useToken();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            minHeight: 64
        }}>
            <img
                src="/logo.svg"
                alt="Logo"
                style={{
                    width: isCollapsed ? 48 : 120,
                    height: isCollapsed ? 48 : 48,
                    transition: 'all 0.2s',
                    objectFit: 'contain'
                }}
            />
        </div>
    );
});

export default SidebarLogo;
