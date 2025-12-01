import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DocumentArrowDownIcon as FloppyDiskIcon } from '@heroicons/react/24/outline';

const CouponModalFooter = ({ currentStep, steps, onClose, onPrevious, onNext, onSubmit, saving, coupon, t }) => {
    return (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={saving}
            >
                {t('cancel') || 'Cancel'}
            </button>

            <div className={`flex items-center gap-3 ${'flex-row-reverse'}`}>
                {currentStep > 0 && (
                    <button
                        type="button"
                        onClick={onPrevious}
                        className="btn-secondary flex items-center flex-row-reverse space-x-reverse"
                        disabled={saving}
                    >
                        <ChevronLeftIcon className="w-[18px] h-[18px]" />
                        <span>{t('previous') || 'Previous'}</span>
                    </button>
                )}

                {currentStep < steps.length - 1 ? (
                    <button
                        type="button"
                        onClick={onNext}
                        className="btn-primary flex items-center flex-row-reverse space-x-reverse"
                        disabled={saving}
                    >
                        <span>{t('next') || 'Next'}</span>
                        <ChevronRightIcon className="w-[18px] h-[18px]" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="btn-primary flex items-center flex-row-reverse space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                    >
                        <FloppyDiskIcon className="w-[18px] h-[18px]" />
                        <span>{saving ? t('saving') : coupon ? t('update') : t('createCoupon')}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CouponModalFooter;
