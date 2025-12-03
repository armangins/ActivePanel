import React, { memo } from 'react';
import { Squares2X2Icon as Grid3x3, ListBulletIcon as List } from '@heroicons/react/24/outline';

const ViewModeToggle = memo(({ viewMode, onViewModeChange, t }) => {
    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                        ? 'bg-white text-primary-500 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                title={t('gridView')}
            >
                <Grid3x3 className="w-5 h-5" />
            </button>
            <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list'
                        ? 'bg-white text-primary-500 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                title={t('listView')}
            >
                <List className="w-5 h-5" />
            </button>
        </div>
    );
});

ViewModeToggle.displayName = 'ViewModeToggle';

export default ViewModeToggle;
