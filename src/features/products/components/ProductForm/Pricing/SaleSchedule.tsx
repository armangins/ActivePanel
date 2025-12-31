import React, { useState } from 'react';
import { Popover, Tooltip, DatePicker, theme } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { UseFormSetValue, useWatch, Control } from 'react-hook-form';
import { ProductFormValues } from '@/features/products/types/schemas';
import dayjs, { Dayjs } from 'dayjs';

interface SaleScheduleProps {
    control: Control<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    isFocused: boolean;
}

export const SaleScheduleDisplay: React.FC<{ control: Control<ProductFormValues> }> = ({ control }) => {
    const { token } = theme.useToken();
    const dateOnSaleFrom = useWatch({ control, name: 'date_on_sale_from' });
    const dateOnSaleTo = useWatch({ control, name: 'date_on_sale_to' });

    if (!dateOnSaleFrom || !dateOnSaleTo) return null;

    return (
        <div style={{
            marginTop: 8,
            fontSize: 12,
            color: token.colorSuccess,
            display: 'flex',
            alignItems: 'center',
            gap: 4
        }}>
            <CalendarOutlined />
            <span>{dateOnSaleFrom} - {dateOnSaleTo}</span>
        </div>
    );
};

export const SaleSchedule: React.FC<SaleScheduleProps> = ({
    control,
    setValue,
    isFocused
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();
    const [isVisible, setIsVisible] = useState(false);

    // We still watch these to color the button if active
    const dateOnSaleFrom = useWatch({ control, name: 'date_on_sale_from' });
    const dateOnSaleTo = useWatch({ control, name: 'date_on_sale_to' });

    const hasSchedule = dateOnSaleFrom && dateOnSaleTo;

    // Fix for the 'as any' issue: explicit type handling
    const rangeValue: [Dayjs | null, Dayjs | null] | null =
        dateOnSaleFrom && dateOnSaleTo
            ? [dayjs(dateOnSaleFrom), dayjs(dateOnSaleTo)]
            : null;

    const content = (
        <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
                style={{ width: 280 }}
                format="YYYY-MM-DD"
                value={rangeValue as [Dayjs, Dayjs] | null}
                onChange={(_, dateStrings) => {
                    const fromDate = dateStrings[0] || null;
                    const toDate = dateStrings[1] || null;

                    setValue('date_on_sale_from', fromDate);
                    setValue('date_on_sale_to', toDate);
                }}
            />
        </div>
    );

    return (
        <Popover
            content={content}
            title={t('scheduleSale')}
            trigger="click"
            open={isVisible}
            onOpenChange={setIsVisible}
            placement="bottomRight"
        >
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: token.borderRadius,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: hasSchedule
                        ? token.colorSuccessBg
                        : (isVisible ? token.colorPrimaryBg : 'transparent'),
                    boxShadow: isFocused && !isVisible && !hasSchedule ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none'
                }}
            >
                <Tooltip title={t('scheduleSale')}>
                    <CalendarOutlined
                        style={{
                            color: hasSchedule ? token.colorSuccess : token.colorPrimary,
                            fontSize: 16
                        }}
                    />
                </Tooltip>
            </div>
        </Popover>
    );
};
