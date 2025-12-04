import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { settingsAPI } from '../../services/api';
import { ArrowRightOnRectangleIcon as LogOut } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import WelcomeStep from './Steps/WelcomeStep';
import StoreDetailsStep from './Steps/StoreDetailsStep';
import ApiConnectionStep from './Steps/ApiConnectionStep';
import CompletionStep from './Steps/CompletionStep';

const Onboarding = () => {
    const { t } = useLanguage();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        storeName: '',
        woocommerceUrl: '',
        consumerKey: '',
        consumerSecret: ''
    });

    const handleNext = async (data) => {
        const updatedData = { ...formData, ...data };
        setFormData(updatedData);

        // Save data incrementally
        try {
            if (step === 1) { // Store Details
                await settingsAPI.update({
                    storeName: updatedData.storeName,
                    woocommerceUrl: updatedData.woocommerceUrl
                });
            } else if (step === 2) { // API Keys
                await settingsAPI.update({
                    consumerKey: updatedData.consumerKey,
                    consumerSecret: updatedData.consumerSecret
                });
            }
        } catch (error) {
            // We might want to show an error here, but for now we proceed
            // or we could block progress.
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleFinish = () => {
        navigate('/dashboard');
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <WelcomeStep onNext={() => setStep(1)} />;
            case 1:
                return <StoreDetailsStep onNext={handleNext} onSkip={handleFinish} initialData={formData} />;
            case 2:
                return (
                    <ApiConnectionStep
                        onNext={handleNext}
                        onBack={handleBack}
                        onSkip={handleFinish}
                        initialData={formData}
                    />
                );
            case 3:
                return <CompletionStep onFinish={handleFinish} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative" dir="rtl">
            {/* Logout Button */}
            <Button
                onClick={logout}
                variant="ghost"
                className="absolute top-4 left-4 flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                title={t('logout') || 'התנתק'}
            >
                <LogOut className="w-6 h-6" />
                <span className="text-sm font-medium hidden sm:inline">{t('logout') || 'התנתק'}</span>
            </Button>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {[0, 1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-1/4 h-2 rounded-full mx-1 ${s <= step ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
