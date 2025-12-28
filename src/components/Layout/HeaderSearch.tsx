
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';
import GlobalSearch from './GlobalSearch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';

const { useToken } = theme;

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
    const { isMobile } = useResponsive();

    // Logic to determine if we show the condensed search button or the full search bar
    const showSearchButton = isMobile && !mobileSearchOpen;

    // Logic to determine if the search bar is visible
    const isSearchVisible = !isMobile || mobileSearchOpen;

    if (showSearchButton) {
        return (
            <Button
                type="text"
                shape="circle"
                icon={<SearchOutlined style={{ fontSize: 20 }} />}
                onClick={() => setMobileSearchOpen(true)}
                style={{
                    width: 40,
                    height: 40,
                    color: token.colorTextSecondary,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0
                }}
            />
        );
    }

    return (
        <div style={{
            maxWidth: 400,
            width: '100%',
            display: isSearchVisible ? 'block' : 'none',
            position: (isMobile && mobileSearchOpen) ? 'absolute' : 'relative',
            top: (isMobile && mobileSearchOpen) ? 0 : 'auto',
            left: (isMobile && mobileSearchOpen) ? 0 : 'auto',
            right: (isMobile && mobileSearchOpen) ? 0 : 'auto',
            zIndex: 20,
            background: token.colorBgContainer,
            padding: (isMobile && mobileSearchOpen) ? '12px' : 0,
            height: (isMobile && mobileSearchOpen) ? 64 : 'auto',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: '100%' }}>
                <GlobalSearch
                    placeholder={t('search')}
                    isRTL={isRTL}
                    autoFocus={isMobile && mobileSearchOpen}
                    style={(isMobile && mobileSearchOpen) ? { maxWidth: '100%' } : {}}
                />
                {(isMobile && mobileSearchOpen) && (
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
