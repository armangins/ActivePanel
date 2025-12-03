import React, { useState, useRef, useEffect, memo } from 'react';
import { ChevronDownIcon as ChevronDown } from '@heroicons/react/24/outline';
import { Button } from '../../ui';

const GridColumnSelector = memo(({
    gridColumns,
    onGridColumnsChange,
    isRTL,
    t
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-500 border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors h-auto`}
            >
                <span>
                    {t('columns') || 'עמודות'}:{' '}
                    {/* On mobile, show effective columns (1 or 2) if desktop value is selected */}
                    <span className="md:hidden">
                        {[1, 2].includes(gridColumns) ? gridColumns : 1}
                    </span>
                    <span className="hidden md:inline">{gridColumns}</span>
                </span>
                <ChevronDown className={`w-4 h-4 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <>
                    {/* Mobile options: 1 or 2 columns */}
                    <div className={`md:hidden absolute ${isRTL ? 'right-0' : 'left-0'} top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[120px]`}>
                        {[1, 2].map((cols) => (
                            <Button
                                key={cols}
                                variant="ghost"
                                onClick={() => {
                                    onGridColumnsChange(cols);
                                    setIsOpen(false);
                                }}
                                className={`w-full h-auto px-4 py-2 text-sm transition-colors rounded-none first:rounded-t-lg last:rounded-b-lg ${gridColumns === cols
                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    } ${isRTL ? 'text-right justify-end' : 'text-left justify-start'}`}
                            >
                                {cols} {t('columns') || 'עמודות'}
                            </Button>
                        ))}
                    </div>
                    {/* Desktop options: 4, 5, 6 columns */}
                    <div className={`hidden md:block absolute ${isRTL ? 'right-0' : 'left-0'} top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[120px]`}>
                        {[4, 5, 6].map((cols) => (
                            <Button
                                key={cols}
                                variant="ghost"
                                onClick={() => {
                                    onGridColumnsChange(cols);
                                    setIsOpen(false);
                                }}
                                className={`w-full h-auto px-4 py-2 text-sm transition-colors rounded-none first:rounded-t-lg last:rounded-b-lg ${gridColumns === cols
                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    } ${isRTL ? 'text-right justify-end' : 'text-left justify-start'}`}
                            >
                                {cols} {t('columns') || 'עמודות'}
                            </Button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
});

GridColumnSelector.displayName = 'GridColumnSelector';

export default GridColumnSelector;
