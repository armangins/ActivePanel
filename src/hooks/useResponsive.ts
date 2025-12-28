import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export const useResponsive = () => {
    const screens = useBreakpoint();

    return {
        isMobile: !screens.md,
        isTablet: screens.md && !screens.lg,
        isDesktop: screens.lg,
        isWide: screens.xl,
        screens // Expose raw screens if needed for specific checks
    };
};
