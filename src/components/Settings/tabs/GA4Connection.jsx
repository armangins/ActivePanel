import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChartBarIcon as BarChart3, CheckCircleIcon as CheckCircle, XCircleIcon as XCircle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input } from '../../ui/inputs';
import { Button } from '../../ui';

const GA4Connection = ({ onTestConnection }) => {
    const { t } = useLanguage();
    const { register, watch, formState: { errors } } = useFormContext();
    const [testing, setTesting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [message, setMessage] = useState(null);

    const ga4PropertyId = watch('ga4PropertyId');

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3 flex-row-reverse">
                    <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-blue-900 font-medium mb-1 text-right">
                            {t('ga4Integration') || 'Google Analytics 4 Integration'}
                        </h3>
                        <p className="text-blue-700 text-sm text-right">
                            {t('ga4Description') || 'Connect your store to Google Analytics 4 to track visitors, sales, and conversion rates directly from your dashboard.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Input
                    {...register('ga4PropertyId')}
                    label={t('ga4PropertyId') || 'GA4 Property ID'}
                    placeholder="e.g. 123456789"
                    dir="ltr"
                    className="text-left"
                    helperText={t('ga4PropertyIdHelp') || 'Found in Admin > Property Settings'}
                    error={errors.ga4PropertyId?.message}
                />

                <Input
                    {...register('ga4MeasurementId')}
                    label={t('ga4MeasurementId') || 'GA4 Measurement ID'}
                    placeholder="e.g. G-XXXXXXXXXX"
                    dir="ltr"
                    className="text-left"
                    helperText={t('ga4MeasurementIdHelp') || 'Found in Admin > Data Streams'}
                    error={errors.ga4MeasurementId?.message}
                />

                <Input
                    {...register('ga4ApiSecret')}
                    label={t('ga4ApiSecret') || 'GA4 API Secret'}
                    type="password"
                    placeholder="e.g. xxxxxxxxxxxx"
                    dir="ltr"
                    className="text-left"
                    helperText={t('ga4ApiSecretHelp') || 'Create in Admin > Data Streams > Measurement Protocol API secrets'}
                    error={errors.ga4ApiSecret?.message}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="button"
                    onClick={onTestConnection}
                    disabled={testing || !ga4PropertyId}
                    variant="secondary"
                    className="flex items-center gap-2"
                >
                    {testing ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></span>
                            <span>{t('testing') || 'Testing...'}</span>
                        </>
                    ) : (
                        <span>{t('testConnection') || 'Test Connection'}</span>
                    )}
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-start flex-row-reverse gap-3 ${message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-right text-sm">{message.text}</p>
                </div>
            )}
        </div>
    );
};

export default GA4Connection;
