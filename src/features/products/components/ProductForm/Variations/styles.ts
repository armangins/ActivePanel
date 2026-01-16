import { theme } from 'antd';
import type { CSSProperties } from 'react';

export const useVariationStyles = () => {
    const { token } = theme.useToken();

    const modalTitleStyle: CSSProperties = {
        fontSize: token.fontSizeHeading3,
        fontWeight: 600,
    };

    const modalDescStyle: CSSProperties = {
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
        fontWeight: 400,
    };

    const footerContainerStyle: CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    };

    const footerInfoStyle: CSSProperties = {
        color: token.colorTextSecondary,
    };

    const footerButtonsStyle: CSSProperties = {
        display: 'flex',
        gap: token.marginXS,
    };

    const stepsContainerStyle: CSSProperties = {
        marginBottom: token.marginLG,
    };

    const stepContentStyle: CSSProperties = {
        minHeight: 300,
    };

    // Wizard Step Styles (Some migrated to component, keeping generic)
    const wizardInstructionStyle: CSSProperties = {
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
        marginBottom: token.marginXS,
    };

    // Scrollable container for Config and Summary
    const scrollableListStyle: CSSProperties = {
        maxHeight: 500,
        overflowY: 'auto',
        paddingRight: 4,
    };

    // Legacy or Shared Styles
    const noOptionsStyle: CSSProperties = {
        color: token.colorTextDisabled,
        fontStyle: 'italic',
        fontSize: token.fontSizeSM,
    };

    return {
        modalTitleStyle,
        modalDescStyle,
        footerContainerStyle,
        footerInfoStyle,
        footerButtonsStyle,
        stepsContainerStyle,
        stepContentStyle,
        wizardInstructionStyle,
        scrollableListStyle,
        noOptionsStyle
    };
};
