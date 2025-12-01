import React from 'react';
import { XMarkIcon as X, CheckCircleIcon } from '@heroicons/react/24/outline';

const CouponModalHeader = ({ coupon, currentStep, steps, onClose, t }) => {
    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                    <h2 className={`text-xl font-semibold text-gray-900 ${'text-right'}`}>
                        {coupon ? t('editCoupon') || 'Edit Coupon' : t('createCoupon') || 'Create Coupon'}
                    </h2>
                    <p className={`text-sm text-gray-500 mt-1 ${'text-right'}`}>
                        {t('step')} {currentStep + 1} {t('of')} {steps.length}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Steps Indicator */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className={`flex items-center ${'flex-row-reverse'} justify-between`}>
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === index;
                        const isCompleted = currentStep > index;

                        return (
                            <div key={step.id} className={`flex items-center ${'flex-row-reverse'} flex-1`}>
                                <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${isActive
                                            ? 'border-primary-500 bg-primary-500 text-white'
                                            : isCompleted
                                                ? 'border-primary-500 bg-primary-500 text-white'
                                                : 'border-gray-300 bg-white text-gray-400'
                                        }`}>
                                        {isCompleted ? (
                                            <CheckCircleIcon className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? 'text-primary-500' : isCompleted ? 'text-primary-500' : 'text-gray-500'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-primary-500' : 'bg-gray-300'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default CouponModalHeader;
