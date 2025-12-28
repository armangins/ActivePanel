import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderStatusCounts } from '@/features/orders/hooks/useOrdersData';
import { useResponsive } from '@/hooks/useResponsive';

interface UseSidebarLogicProps {
    onClose: () => void;
    externalCollapsed?: boolean;
}

export const useSidebarLogic = ({ onClose, externalCollapsed }: UseSidebarLogicProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const { data: statusCounts } = useOrderStatusCounts();
    const { isDesktop } = useResponsive();

    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
    // Semantic mobile check - standard across app
    const isMobile = !isDesktop;

    const [openKeys, setOpenKeys] = useState<string[]>(() => {
        // Open products submenu if we're on a products-related page
        return location.pathname.startsWith('/products') ? ['/products'] : [];
    });

    // Calculate pending orders count (excluding cancelled and completed)
    const pendingOrdersCount = statusCounts
        ? (statusCounts.pending || 0) + (statusCounts.processing || 0) + (statusCounts['on-hold'] || 0)
        : 0;

    // Update openKeys when location changes
    useEffect(() => {
        if (location.pathname.startsWith('/products')) {
            setOpenKeys(['/products']);
        }
    }, [location.pathname]);

    // Handle window resize for mobile detection - REPLACED BY useResponsive
    // kept logic purely for documentation reference of what removed
    /*
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    */

    const handleMenuClick = ({ key }: { key: string }) => {
        // Map menu keys to actual routes
        const routeMap: Record<string, string> = {
            '/products/list': '/products',
            '/products/add': '/products/add'
        };

        const route = routeMap[key] || key;
        navigate(route);

        // Close sidebar on mobile when navigating
        if (isMobile) {
            onClose();
        }
    };

    return {
        t,
        isRTL,
        openKeys,
        setOpenKeys,
        isCollapsed,
        isMobile,
        pendingOrdersCount,
        handleMenuClick,
        selectedKeys: [location.pathname === '/products' ? '/products/list' : location.pathname]
    };
};
