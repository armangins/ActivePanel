import React from 'react';
import { ArrowRightOutlined as ArrowRightIcon } from '@ant-design/icons';
import { Button } from '../../ui';
import { useLanguage } from '../../../contexts/LanguageContext';

const CouponModalFooter = ({ currentStep, steps, onClose, onPrevious, onNext, onSubmit, saving, coupon, t, validationErrors }) => {
    const { isRTL } = useLanguage();
    // Check if there are validation errors for the current step
    const hasErrors = validationErrors && Object.keys(validationErrors).length > 0;
    
    return (
        <div className="flex flex-col gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            {/* Validation Error Message */}
            {hasErrors && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-right">
                    <p className="text-sm font-medium text-orange-800 mb-1">
                        {t('pleaseFixErrors') || 'Please fix the following errors:'}
                    </p>
                    <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                        {Object.entries(validationErrors).map(([field, message]) => (
                            <li key={field}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="flex items-center justify-between">
                {currentStep < steps.length - 1 ? (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onNext}
                        className="group flex items-center gap-2"
                        disabled={saving}
                        title={hasErrors ? (t('pleaseFixErrors') || 'Please fix errors before continuing') : ''}
                    >
                        <span>{t('next') || 'Next'}</span>
                        <ArrowRightIcon className={`w-[18px] h-[18px] transition-transform duration-200 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onSubmit}
                        disabled={saving || hasErrors}
                        title={hasErrors ? (t('pleaseFixErrors') || 'Please fix errors before saving') : ''}
                    >
                        {saving ? t('saving') : coupon ? t('update') : t('createCoupon')}
                    </Button>
                )}

                <div className={`flex items-center gap-3 ${'flex-row-reverse'}`}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        {t('cancel') || 'Cancel'}
                    </Button>

                    {currentStep > 0 && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onPrevious}
                            className="group flex items-center gap-2"
                            disabled={saving}
                        >
                            <span>{t('previous') || 'Previous'}</span>
                            <ArrowRightIcon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponModalFooter;
