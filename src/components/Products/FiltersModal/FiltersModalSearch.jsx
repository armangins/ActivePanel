import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const FiltersModalSearch = ({ searchQuery, onSearchChange, t, isRTL }) => {
    return (
        <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
                {t('searchProducts')}
            </label>
            <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchProducts')}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                allowClear
            />
        </div>
    );
};

export default FiltersModalSearch;
