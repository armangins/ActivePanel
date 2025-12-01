import React from 'react';
import { KeyIcon as Key } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../ui/inputs';

const WordPressSettings = ({ settings, onSettingsChange }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <p className={`text-sm text-gray-600 ${'text-right'}`}>
                {t('wpAppPasswordDesc') || 'נדרש להעלאת תמונות. קבל אותו מ-WordPress: משתמשים → פרופיל → סיסמאות אפליקציה'}
            </p>

            <div>
                <Input
                    id="wordpress-username"
                    name="wordpressUsername"
                    label={t('wpUsername') || 'WordPress Username'}
                    type="text"
                    placeholder={t('wpUsernamePlaceholder') || 'your-wordpress-username'}
                    value={settings.wordpressUsername}
                    onChange={(e) => onSettingsChange({ ...settings, wordpressUsername: e.target.value })}
                    leftIcon={Key}
                    autoComplete="username"
                />
            </div>

            <div>
                <Input
                    id="app-password"
                    name="wordpressAppPassword"
                    label={t('appPassword') || 'Application Password'}
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                    value={settings.wordpressAppPassword}
                    onChange={(e) => onSettingsChange({ ...settings, wordpressAppPassword: e.target.value })}
                    leftIcon={Key}
                    autoComplete="current-password"
                />
                <p className={`text-xs text-gray-500 mt-1 ${'text-right'}`}>
                    {t('appPasswordDesc') || 'Generated from WordPress → Users → Profile → Application Passwords'}
                </p>
            </div>
        </div>
    );
};

export default WordPressSettings;
