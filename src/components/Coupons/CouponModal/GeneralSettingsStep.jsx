import React from 'react';
import { TagIcon as Tag, HashtagIcon as Percent, CurrencyDollarIcon as DollarSign, CalendarIcon } from '@heroicons/react/24/outline';
import { Input } from '../../ui/inputs';

const GeneralSettingsStep = ({ formData, setFormData, validationErrors, t }) => {
    return (
        <div className="space-y-6">
            <div>
                <Input
                    id="coupon-code"
                    name="code"
                    label={`${t('couponCode') || 'Coupon Code'} *`}
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder={t('enterCouponCode') || 'Enter coupon code'}
                    error={validationErrors.code}
                    required
                    leftIcon={Tag}
                    autoComplete="off"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="discount-type" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                        {t('discountType') || 'Discount Type'} *
                    </label>
                    <select
                        id="discount-type"
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        className="input-field"
                    >
                        <option value="percent">{t('percentageDiscount') || 'Percentage discount'}</option>
                        <option value="fixed_cart">{t('fixedCartDiscount') || 'Fixed cart discount'}</option>
                        <option value="fixed_product">{t('fixedProductDiscount') || 'Fixed product discount'}</option>
                    </select>
                </div>

                <div>
                    <Input
                        id="coupon-amount"
                        name="amount"
                        label={`${t('amount') || 'Amount'} *`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder={formData.discount_type === 'percent' ? '10' : '50.00'}
                        error={validationErrors.amount}
                        required
                        rightIcon={formData.discount_type === 'percent' ? Percent : DollarSign}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="coupon-description" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                    {t('description') || 'Description'}
                </label>
                <textarea
                    id="coupon-description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder={t('couponDescription') || 'Internal description (not visible to customers)'}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, free_shipping: !formData.free_shipping })}>
                    <input
                        type="checkbox"
                        id="free_shipping"
                        name="free_shipping"
                        checked={formData.free_shipping}
                        onChange={(e) => setFormData({ ...formData, free_shipping: e.target.checked })}
                        className="w-4 h-4 text-primary-500 rounded"
                    />
                    <label htmlFor="free_shipping" className="text-sm text-gray-700 cursor-pointer flex-1">
                        {t('allowFreeShipping') || 'Allow free shipping'}
                    </label>
                </div>

                <div>
                    <Input
                        id="coupon-expiry-date"
                        name="date_expires"
                        label={t('expiryDate') || 'Expiry Date'}
                        type="date"
                        value={formData.date_expires}
                        onChange={(e) => setFormData({ ...formData, date_expires: e.target.value })}
                        leftIcon={CalendarIcon}
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralSettingsStep;
