import React from 'react';
import { Input } from '../../ui/inputs';

const UsageLimitsStep = ({ formData, setFormData, t }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <label htmlFor="usage-limit" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                        {t('usageLimitPerCoupon') || 'Usage Limit Per Coupon'}
                    </label>
                    <Input
                        id="usage-limit"
                        name="usage_limit"
                        label={t('usageLimitPerCoupon') || 'Usage Limit Per Coupon'}
                        type="number"
                        min="0"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                        placeholder={t('unlimited') || 'Unlimited'}
                        autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {t('usageLimitPerCouponDesc') || 'Leave empty for unlimited uses'}
                    </p>
                </div>

                <div className="card">
                    <label htmlFor="usage-limit-per-user" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                        {t('usageLimitPerUser') || 'Usage Limit Per User'}
                    </label>
                    <Input
                        id="usage-limit-per-user"
                        name="usage_limit_per_user"
                        label={t('usageLimitPerUser') || 'Usage Limit Per User'}
                        type="number"
                        min="0"
                        value={formData.usage_limit_per_user}
                        onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                        placeholder={t('unlimited') || 'Unlimited'}
                        autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {t('usageLimitPerUserDesc') || 'Leave empty for unlimited uses per user'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsageLimitsStep;
