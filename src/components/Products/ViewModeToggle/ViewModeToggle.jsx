import React, { memo } from 'react';
import { AppstoreOutlined as Grid3x3, UnorderedListOutlined as List } from '@ant-design/icons';
import { Button } from '../../ui';

const ViewModeToggle = memo(({ viewMode, onViewModeChange, t }) => {
    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewModeChange('grid')}
                className={`rounded transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-primary-500 shadow-sm hover:bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                title={t('gridView')}
            >
                <Grid3x3 className="w-5 h-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewModeChange('list')}
                className={`rounded transition-colors ${viewMode === 'list'
                    ? 'bg-white text-primary-500 shadow-sm hover:bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                title={t('listView')}
            >
                <List className="w-5 h-5" />
            </Button>
        </div>
    );
});

ViewModeToggle.displayName = 'ViewModeToggle';

export default ViewModeToggle;
