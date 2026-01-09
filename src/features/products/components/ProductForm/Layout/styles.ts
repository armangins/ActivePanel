import { theme } from 'antd';
import type { CSSProperties } from 'react';

export const useLayoutStyles = () => {
    const { token } = theme.useToken();

    const footerStyle: CSSProperties = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        padding: '16px 24px',
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'flex-end',
    };

    const headerContainerStyle: CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    };

    const headerTitleStyle: CSSProperties = {
        margin: 0,
    };

    return {
        footerStyle,
        headerContainerStyle,
        headerTitleStyle,
    };
};
