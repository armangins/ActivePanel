import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, theme, Grid } from 'antd';
import GlobalSearch from './GlobalSearch';
import { useLanguage } from '@/contexts/LanguageContext';

const { useToken } = theme;
const { useBreakpoint } = Grid;

interface HeaderSearchProps {
    mobileSearchOpen: boolean;
    setMobileSearchOpen: (isOpen: boolean) => void;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({
    mobileSearchOpen,
    setMobileSearchOpen,
}) => {
    const { t, isRTL } = useLanguage();
    const { token } = useToken();
    const screens = useBreakpoint();

    // Logic to determine if we show the condensed search button or the full search bar
    const showSearchButton = !screens.md && !mobileSearchOpen;

    // Logic to determine if the search bar is visible
    const isSearchVisible = screens.md || mobileSearchOpen;

    if (showSearchButton) {
        return (
            <Button
                type="text"
                icon={<SearchOutlined style={{ fontSize: 20 }} />}
                onClick={() => setMobileSearchOpen(true)}
                style={{ width: 40, height: 40, color: token.colorTextSecondary }}
            />
        );
    }

    return (
        <div style={{
            maxWidth: 400,
            width: '100%',
            display: isSearchVisible ? 'block' : 'none',
            position: (!screens.md && mobileSearchOpen) ? 'absolute' : 'relative',
            top: (!screens.md && mobileSearchOpen) ? 0 : 'auto',
            left: (!screens.md && mobileSearchOpen) ? 0 : 'auto',
            right: (!screens.md && mobileSearchOpen) ? 0 : 'auto',
            zIndex: 20,
            background: token.colorBgContainer,
            padding: (!screens.md && mobileSearchOpen) ? '12px' : 0,
            height: (!screens.md && mobileSearchOpen) ? 64 : 'auto',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: '100%' }}>
                <GlobalSearch
                    placeholder={t('search')}
                    isRTL={isRTL}
                    autoFocus={!screens.md && mobileSearchOpen}
                    style={(!screens.md && mobileSearchOpen) ? { maxWidth: '100%' } : {}}
                />
                {(!screens.md && mobileSearchOpen) && (
                    <Button
                        type="text"
                        onClick={() => setMobileSearchOpen(false)}
                    >
                        {t('cancel') || 'Cancel'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default HeaderSearch;
