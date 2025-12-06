import React from 'react';
import { TrashIcon as Trash2 } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useLanguage } from '../../../contexts/LanguageContext';

const SystemSettings = ({ onClearCache }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div>
                <p className={`text-sm text-gray-600 mb-4 ${'text-right'}`}>
                    {t('cacheManagementDesc') || 'נקה נתונים שמורים ב-Cache כדי לטעון מחדש מהשרת. זה יכול לעזור אם הנתונים נראים לא מעודכנים.'}
                </p>
                <Button
                    onClick={onClearCache}
                    variant="secondary"
                    className="flex items-center flex-row-reverse space-x-reverse"
                >
                    <Trash2 className="w-[18px] h-[18px]" />
                    <span>{t('clearCache') || 'נקה Cache'}</span>
                </Button>
            </div>
        </div>
    );
};

export default SystemSettings;
