import { Modal, Steps, Button, Form } from 'antd';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCouponForm } from '../../hooks/useCouponForm';
import { Coupon } from '../../types';
import { GeneralStep } from './GeneralStep';
import { UsageRestrictionStep } from './UsageRestrictionStep';
import { UsageLimitStep } from './UsageLimitStep';

interface CouponModalProps {
    open: boolean;
    onClose: () => void;
    coupon?: Coupon | null;
    messageApi?: any;
}

const CouponModal = ({ open, onClose, coupon, messageApi }: CouponModalProps) => {
    const { t, isRTL } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const { form, isLoading, onSubmit, isEditMode, generateRandomCode } = useCouponForm(coupon, onClose, messageApi);

    const steps = [
        { title: t('general') || 'General', content: <GeneralStep form={form} generateRandomCode={generateRandomCode} /> },
        { title: t('usageRestriction') || 'Usage Restriction', content: <UsageRestrictionStep form={form} /> },
        { title: t('usageLimits') || 'Usage Limits', content: <UsageLimitStep form={form} /> }
    ];

    const next = async () => {
        // Validate current step fields before moving
        try {
            if (currentStep === 0) {
                // Trigger validation for specific fields in the first step
                const valid = await form.trigger(['code', 'amount', 'discount_type']);
                if (!valid) return;
            }
            setCurrentStep(currentStep + 1);
        } catch (e) {
            // detailed validation errors are handled by form
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <Modal
            title={isEditMode ? (t('editCoupon') || 'Edit Coupon') : (t('addCoupon') || 'Add New Coupon')}
            open={open}
            onCancel={onClose}
            footer={null}
            width={720}
            maskClosable={false}
        >
            <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} />

            <Form
                layout="vertical"
                initialValues={{ discount_type: 'percent' }}
            >
                <div style={{ minHeight: 300 }}>
                    {steps[currentStep].content}
                </div>

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    {currentStep > 0 && (
                        <Button onClick={prev}>
                            {t('previous') || 'Previous'}
                        </Button>
                    )}
                    {currentStep < steps.length - 1 && (
                        <Button type="primary" onClick={next}>
                            {t('next') || 'Next'}
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button type="primary" onClick={() => onSubmit()} loading={isLoading}>
                            {t('done') || 'Done'}
                        </Button>
                    )}
                </div>
            </Form>
        </Modal>
    );
};

export default CouponModal;
