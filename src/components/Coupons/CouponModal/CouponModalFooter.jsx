import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DocumentArrowDownIcon as FloppyDiskIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../ui';

const CouponModalFooter = ({ currentStep, steps, onClose, onPrevious, onNext, onSubmit, saving, coupon, t }) => {
    return (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={saving}
            >
                {t('cancel') || 'Cancel'}
            </Button>

            <div className={`flex items-center gap-3 ${'flex-row-reverse'}`}>
                {currentStep > 0 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onPrevious}
                        className="flex items-center flex-row-reverse space-x-reverse"
                        disabled={saving}
                    >
                        <ChevronLeftIcon className="w-[18px] h-[18px]" />
                        <span>{t('previous') || 'Previous'}</span>
                    </Button>
                )}

                {currentStep < steps.length - 1 ? (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onNext}
                        className="flex items-center flex-row-reverse space-x-reverse"
                        disabled={saving}
                    >
                        <span>{t('next') || 'Next'}</span>
                        <ChevronRightIcon className="w-[18px] h-[18px]" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onSubmit}
                        className="flex items-center flex-row-reverse space-x-reverse"
                        disabled={saving}
                    >
                        <FloppyDiskIcon className="w-[18px] h-[18px]" />
                        <span>{saving ? t('saving') : coupon ? t('update') : t('createCoupon')}</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CouponModalFooter;
