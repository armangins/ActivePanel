import React from 'react';
import { SearchInput } from '../../ui';

const FiltersModalSearch = ({ searchQuery, onSearchChange, t, isRTL }) => {
    return (
        <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
                {t('searchProducts')}
            </label>
            <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={t('searchProducts')}
                isRTL={isRTL}
            />
        </div>
    );
};

export default FiltersModalSearch;
