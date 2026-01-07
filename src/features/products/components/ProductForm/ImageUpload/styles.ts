import { theme } from 'antd';
import type { CSSProperties } from 'react';

export const useImageUploadStyles = () => {
    const { token } = theme.useToken();

    const draggableItemStyle = (isDragging: boolean): CSSProperties => ({
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
    });

    const primaryTagStyle: CSSProperties = {
        position: 'absolute',
        top: 0,
        insetInlineStart: 0, // Use logical property for RTL support
        zIndex: 10,
        fontSize: '11px',
        fontWeight: 500,
        padding: '2px 8px',
        borderTopLeftRadius: 0, // Match corner
        borderBottomRightRadius: token.borderRadius, // Rounded opposite corner
        background: token.colorPrimary,
        color: '#fff',
        border: 'none',
        lineHeight: '1.5',
    };

    const tagContainerStyle: CSSProperties = {
        position: 'relative',
    };

    const uploadButtonStyle: CSSProperties = {
        border: 0,
        background: 'none',
    };

    const uploadButtonTextStyle: CSSProperties = {
        marginTop: token.marginXS,
    };

    const modalImageStyle: CSSProperties = {
        width: '100%',
    };

    // CSS string for upload list sizing
    const uploadListSizeCSS = `
        .ant-upload-list-picture-card .ant-upload-list-item,
        .ant-upload-list-picture-card .ant-upload-select {
            width: 200px !important;
            height: 200px !important;
        }
        .ant-upload-list-picture-card .ant-upload-list-item-container {
            width: 200px !important;
            height: 200px !important;
        }
    `;

    const noteStyle: CSSProperties = {
        marginTop: token.marginXS,
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXXS,
    };

    return {
        draggableItemStyle,
        primaryTagStyle,
        tagContainerStyle,
        uploadButtonStyle,
        uploadButtonTextStyle,
        modalImageStyle,
        uploadListSizeCSS,
        noteStyle,
    };
};
