import React, { useEffect, useState } from 'react';
import { CloseOutlined as X, CheckCircleOutlined as CheckCircleIcon } from '@ant-design/icons';
import { Button } from '../../ui';

const CouponModalHeader = ({ coupon, currentStep, steps, onClose, t }) => {
    const [animatingStep, setAnimatingStep] = useState(null);
    const [prevStep, setPrevStep] = useState(currentStep);

    useEffect(() => {
        if (currentStep !== prevStep && prevStep !== null) {
            setAnimatingStep(currentStep);
            setPrevStep(currentStep);
            
            // Reset animation after it completes
            const timer = setTimeout(() => {
                setAnimatingStep(null);
            }, 800); // Match animation duration
            
            return () => clearTimeout(timer);
        } else if (prevStep === null) {
            setPrevStep(currentStep);
        }
    }, [currentStep, prevStep]);

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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Steps Indicator */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-center">
                    <div className={`flex items-center flex-row-reverse`}>
                        {steps.slice().reverse().map((step, reversedIndex) => {
                            const index = steps.length - 1 - reversedIndex;
                            const Icon = step.icon;
                            const isActive = currentStep === index;
                            const isCompleted = currentStep > index;
                            const isAnimating = animatingStep === index;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className={`flex items-center flex-row-reverse`}>
                                        <div className={`flex items-center gap-2 flex-row-reverse`}>
                                            <div 
                                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
                                                    isActive
                                                        ? 'border-primary-500 bg-primary-500 text-white'
                                                        : isCompleted
                                                            ? 'border-primary-500 bg-primary-500 text-white'
                                                            : 'border-gray-300 bg-white text-gray-400'
                                                } ${
                                                    isAnimating ? 'ring-4 ring-primary-200 ring-opacity-75' : ''
                                                }`}
                                                style={{
                                                    transform: isAnimating ? 'scale(1.15)' : 'scale(1)',
                                                    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                                }}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircleIcon 
                                                        className={`w-5 h-5 transition-all duration-500 ${
                                                            isAnimating ? 'scale-125' : ''
                                                        }`}
                                                        style={{
                                                            animation: isAnimating ? 'ping 0.8s cubic-bezier(0, 0, 0.2, 1)' : undefined
                                                        }}
                                                    />
                                                ) : (
                                                    <Icon 
                                                        className={`w-5 h-5 transition-all duration-500 ${
                                                            isAnimating ? 'scale-125' : ''
                                                        }`}
                                                        style={{
                                                            animation: isAnimating ? 'stepBounce 0.8s ease-in-out' : undefined
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-primary-500' : isCompleted ? 'text-primary-500' : 'text-gray-500'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                    {reversedIndex < steps.length - 1 && (
                                        <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${isCompleted ? 'bg-primary-500' : 'bg-gray-300'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes stepBounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    25% {
                        transform: translateY(-8px) scale(1.1);
                    }
                    50% {
                        transform: translateY(0) scale(1.15);
                    }
                    75% {
                        transform: translateY(-4px) scale(1.1);
                    }
                }
            `}} />
        </>
    );
};

export default CouponModalHeader;
