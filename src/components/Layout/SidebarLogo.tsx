import React from 'react';

interface SidebarLogoProps {
    isCollapsed: boolean;
    isRTL: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = React.memo(({ isCollapsed, isRTL }) => {
    return (
        <div style={{
            padding: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : (isRTL ? 'flex-end' : 'flex-start'),
            minHeight: 64
        }}>
            {isCollapsed ? (
                <img
                    src="/logo.svg"
                    alt="Logo"
                    style={{
                        width: 40,
                        height: 40,
                        objectFit: 'contain'
                    }}
                />
            ) : (
                <img
                    src="/logo.svg"
                    alt="Logo"
                    style={{
                        height: 40,
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            )}
        </div>
    );
});

export default SidebarLogo;
