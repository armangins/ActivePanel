import { Form, InputNumber } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

export const UsageLimitStep = () => {
    const { t } = useLanguage();

    return (
        <div style={{ paddingTop: 20 }}>
            <Form.Item
                name="usage_limit"
                label={t('usageLimitPerCoupon') || 'Usage limit per coupon'}
                tooltip={t('usageLimitTip') || 'How many times this coupon can be used in total.'}
            >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="∞" />
            </Form.Item>

            <Form.Item
                name="usage_limit_per_user"
                label={t('usageLimitPerUser') || 'Usage limit per user'}
                tooltip={t('usageLimitUserTip') || 'How many times this coupon can be used by an individual user.'}
            >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="∞" />
            </Form.Item>
        </div>
    );
};
