import React from 'react';
import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { ModalHeader } from '../../ui';

const FiltersModalHeader = ({ t, onClose }) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
                {t('filters')}
            </h3>
            <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                aria-label={t('close') || 'Close'}
            >
                <X className="w-5 h-5" />
            </Button>
        </div>
    );
};

export default FiltersModalHeader;
