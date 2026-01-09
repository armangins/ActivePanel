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

    const selectorLabelStyle: CSSProperties = {
        fontWeight: 600,
        marginBottom: token.marginXS,
    };

    const tagsContainerStyle: CSSProperties = {
        display: 'flex',
        gap: token.marginXS,
        flexWrap: 'wrap',
    };

    const cardsContainerStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: token.margin,
    };

    const cardHeaderStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXS,
    };

    const cardExtraStyle: CSSProperties = {
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
    };

    const termSelectorContainerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: token.marginXS,
    };

    const termOptionStyle = (isSelected: boolean): CSSProperties => ({
        padding: '6px 16px',
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorder}`,
        background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
        color: isSelected ? token.colorPrimary : token.colorText,
        cursor: 'pointer',
        fontSize: token.fontSize,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    });

    const noOptionsStyle: CSSProperties = {
        color: token.colorTextDisabled,
        fontSize: token.fontSizeSM,
        fontStyle: 'italic',
    };

    const wizardInstructionStyle: CSSProperties = {
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
        marginBottom: token.marginXS,
    };

    return {
        modalTitleStyle,
        modalDescStyle,
        footerContainerStyle,
        footerInfoStyle,
        footerButtonsStyle,
        stepsContainerStyle,
        stepContentStyle,
        selectorLabelStyle,
        tagsContainerStyle,
        cardsContainerStyle,
        cardHeaderStyle,
        cardExtraStyle,
        termSelectorContainerStyle,
        termOptionStyle,
        noOptionsStyle,
        wizardInstructionStyle,
    };
};
