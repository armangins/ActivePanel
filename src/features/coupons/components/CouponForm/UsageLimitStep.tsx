import { Form, InputNumber } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { Controller } from 'react-hook-form';

interface UsageLimitStepProps {
    form: any;
}

export const UsageLimitStep = ({ form }: UsageLimitStepProps) => {
    const { t } = useLanguage();

    return (
        <div style={{ paddingTop: 20 }}>
            <Controller
                name="usage_limit"
                control={form.control}
                render={({ field }) => (
                    <Form.Item
                        label={t('usageLimitPerCoupon') || 'Usage limit per coupon'}
                        tooltip={t('usageLimitTip') || 'How many times this coupon can be used in total.'}
                    >
                        <InputNumber {...field} style={{ width: '100%' }} min={0} placeholder="∞" />
                    </Form.Item>
                )}
            />

            <Controller
                name="usage_limit_per_user"
                control={form.control}
                render={({ field }) => (
                    <Form.Item
                        label={t('usageLimitPerUser') || 'Usage limit per user'}
                        tooltip={t('usageLimitUserTip') || 'How many times this coupon can be used by an individual user.'}
                    >
                        <InputNumber {...field} style={{ width: '100%' }} min={0} placeholder="∞" />
                    </Form.Item>
                )}
            />
        </div>
    );
};
