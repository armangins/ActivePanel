import { ReactNode } from 'react';
import { ConfigProvider, App } from 'antd';
import heIL from 'antd/locale/he_IL';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { useLanguage } from '@/contexts/LanguageContext';

// Configure dayjs to use Hebrew locale
dayjs.locale('he');

interface AntdProviderProps {
    children: ReactNode;
}

/**
 * Ant Design Provider
 * 
 * Configures the global Ant Design theme, locale, and direction (RTL/LTR).
 * Sets up design tokens for colors, typography, and spacing.
 * Wraps the app in <App> to enable static methods (message, notification, modal).
 * 
 * @param children - Child components to wrap
 */
export const AntdProvider = ({ children }: AntdProviderProps) => {
    const { isRTL } = useLanguage();

    return (
        <ConfigProvider
            locale={heIL}
            direction={isRTL ? 'rtl' : 'ltr'}
            theme={{
                token: {
                    fontFamily: "'Noto Sans Hebrew', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
                    fontSize: 14,
                    borderRadius: 8,

                    // Seed Tokens - Primary Colors
                    colorPrimary: '#3B82F6', // Blue primary color
                    colorSuccess: '#10B981', // Green
                    colorWarning: '#F59E0B', // Orange/Yellow
                    colorError: '#EF4444', // Red
                    colorInfo: '#3B82F6', // Blue (same as primary)
                    colorLink: '#3B82F6',

                    // Text Colors
                    colorText: '#1F2937', // Primary text - dark gray
                    colorTextSecondary: '#6B7280', // Secondary text - medium gray
                    colorTextTertiary: '#9CA3AF', // Tertiary text - light gray
                    colorTextQuaternary: '#D1D5DB', // Disabled text

                    // Background Colors
                    colorBgContainer: '#FFFFFF', // Container/Card background
                    colorBgElevated: '#FFFFFF', // Elevated elements (modals, dropdowns)
                    colorBgLayout: '#F2F7FB', // Page layout background
                    colorBgSpotlight: '#FAFAFA', // Spotlight/hover background
                    colorBgMask: 'rgba(0, 0, 0, 0.45)', // Mask/overlay

                    // Border Colors
                    colorBorder: '#E5E7EB', // Default border
                    colorBorderSecondary: '#F3F4F6', // Secondary border (lighter)
                    colorSplit: '#E5E7EB', // Split line color

                    // Fill Colors (for backgrounds of elements)
                    colorFill: '#F3F4F6',
                    colorFillSecondary: '#F9FAFB',
                    colorFillTertiary: '#FAFAFA',
                    colorFillQuaternary: '#FCFCFC',

                    // Typography Heading Sizes
                    fontSizeHeading1: 28.38,
                    fontSizeHeading2: 25.23,
                    fontSizeHeading3: 22.43,
                    fontSizeHeading4: 19.93,
                    fontSizeHeading5: 17.72,

                    // Standard Ant Design breakpoints
                    screenXS: 480,
                    screenSM: 576,
                    screenMD: 768,
                    screenLG: 992,
                    screenXL: 1200,
                    screenXXL: 1600,
                },
                components: {
                    Typography: {
                        fontWeightStrong: 700,
                    },
                    Button: {
                        primaryShadow: '0 2px 0 rgba(59, 130, 246, 0.1)',
                    },
                    Tooltip: {
                        colorTextLightSolid: '#1F2937', // Dark gray/black text for tooltips
                        colorBgSpotlight: '#FFFFFF', // White background for tooltips
                    },
                    Menu: {
                        itemBg: '#FFFFFF', // White background for menu items
                        itemColor: '#1F2937', // Dark gray text for menu items
                        itemHoverBg: '#F9FAFB', // Light hover background
                        itemHoverColor: '#3B82F6', // Blue text on hover
                        itemSelectedBg: '#EFF6FF', // Light blue background for selected menu items
                        itemSelectedColor: '#3B82F6', // Blue text for selected items
                        itemActiveBg: '#EFF6FF', // Active item background
                        subMenuItemBg: '#FFFFFF', // Submenu background
                    },
                    Layout: {
                        siderBg: '#FFFFFF',
                        headerBg: '#FFFFFF',
                    }
                }
            }}
        >
            <App>
                {children}
            </App>
        </ConfigProvider>
    );
};
