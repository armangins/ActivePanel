import React from 'react';
import { Menu, Badge } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    SettingOutlined,
    DollarOutlined,
    FolderOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

// Interface for TFunction
type TFunction = (key: string) => string;

interface SidebarMenuProps {
    t: TFunction;
    isRTL: boolean;
    isCollapsed: boolean;
    pendingOrdersCount: number;
    openKeys: string[];
    setOpenKeys: (keys: string[]) => void;
    selectedKeys: string[];
    onMenuClick: (info: any) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
    t,
    isRTL,
    isCollapsed,
    pendingOrdersCount,
    openKeys,
    setOpenKeys,
    selectedKeys,
    onMenuClick
}) => {
    const menuItems: MenuProps['items'] = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: t('dashboard'),
            // @ts-ignore
            'data-onboarding': 'dashboard-nav'
        },
        {
            key: '/products',
            icon: <ShoppingOutlined />,
            label: t('products'),
            // @ts-ignore
            'data-onboarding': 'products-nav',
            children: [
                {
                    key: '/products/list',
                    label: 'כל המוצרים'
                },
                {
                    key: '/products/add',
                    label: 'הוסף מוצר חדש'
                },
                {
                    key: '/products/attributes',
                    label: t('attributes') || 'Attributes'
                }
            ]
        },
        {
            key: '/orders',
            icon: (
                <Badge
                    count={pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                    offset={isCollapsed ? [10, 0] : [10, 0]}
                    size="small"
                >
                    <ShoppingCartOutlined />
                </Badge>
            ),
            label: t('orders'),
            // @ts-ignore
            'data-onboarding': 'orders-nav'
        },
        { key: '/customers', icon: <TeamOutlined />, label: t('customers') },
        { key: '/coupons', icon: <DollarOutlined />, label: t('coupons') },
        { key: '/categories', icon: <FolderOutlined />, label: t('categories') || 'Categories' },
        {
            key: '/settings', icon: <SettingOutlined />, label: t('settings'),
            // @ts-ignore
            'data-onboarding': 'settings-nav'
        },
    ];

    return (
        <>
            <style>{`
        /* Fix for badge clipping in collapsed mode */
        .ant-menu-inline-collapsed .ant-menu-item,
        .ant-menu-inline-collapsed .ant-menu-item-icon {
          overflow: visible !important;
        }
      `}</style>
            <Menu
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={setOpenKeys as any}
                items={menuItems}
                onClick={onMenuClick}
                style={{
                    borderRight: 0,
                    flex: 1,
                    direction: isRTL ? 'rtl' : 'ltr',
                    background: 'transparent'
                }}
                inlineCollapsed={isCollapsed}
                theme="light"
            />
        </>
    );
};

export default SidebarMenu;
