
import React from 'react';
import { Input, InputNumber, Checkbox } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCombinationSignature } from '@/features/products/utils/variationUtils';
import { useVariationStyles } from './styles';

export interface VariationPricingData {
    regular_price: string;
    sale_price?: string;
    stock_status: string;
    manage_stock: boolean;
    stock_quantity?: number;
    sku?: string;
}

interface VariationPricingStepProps {
    combinations?: { id: number | string; name: string; option: string }[][];
    pricingData: Record<string, VariationPricingData>;
    onPriceChange: (signature: string, field: keyof VariationPricingData, value: any) => void;
}

export const VariationPricingStep: React.FC<VariationPricingStepProps> = ({
    combinations = [],
    pricingData,
    onPriceChange
}) => {
    const { t } = useLanguage();
    const styles = useVariationStyles();

    return (
        <div style={{ padding: '0 8px' }}>
            <div style={styles.wizardInstructionStyle}>
                {t('setPriceForEachVariation') || 'Set price and stock for each variation'}
            </div>

            <div style={styles.scrollableListStyle}>
                {combinations.map((combo, index) => {
                    const signature = getCombinationSignature(combo);
                    const data = pricingData[signature] || {
                        regular_price: '',
                        stock_status: 'instock',
                        manage_stock: false
                    };

                    return (
                        <div key={index} style={{ ...styles.variationRowStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ ...styles.variationInfoStyle, marginBottom: 8, width: '100%' }}>
                                <span style={styles.variationIndexStyle}>#{index + 1}</span>
                                <span style={{ fontWeight: 600 }}>{combo.map(c => `${c.name}: ${c.option}`).join(', ')}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
                                {/* Price Field - Mandatory */}
                                <div style={{ flex: 1, minWidth: 120 }}>
                                    <div style={{ fontSize: 12, marginBottom: 4 }}>{t('regular_price')} <span style={{ color: 'red' }}>*</span></div>
                                    <Input
                                        prefix="₪"
                                        placeholder="0.00"
                                        value={data.regular_price}
                                        onChange={(e) => onPriceChange(signature, 'regular_price', e.target.value)}
                                        status={!data.regular_price ? 'warning' : ''}
                                    />
                                </div>

                                {/* Stock Quantity - Conditional */}
                                {data.manage_stock && (
                                    <div style={{ width: 100 }}>
                                        <div style={{ fontSize: 12, marginBottom: 4 }}>{t('quantity')}</div>
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            value={data.stock_quantity}
                                            onChange={(val) => onPriceChange(signature, 'stock_quantity', val)}
                                        />
                                    </div>
                                )}

                                {/* Manage Stock Checkbox */}
                                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 18 }}>
                                    <Checkbox
                                        checked={data.manage_stock}
                                        onChange={(e) => onPriceChange(signature, 'manage_stock', e.target.checked)}
                                    >
                                        {t('manage_stock')}
                                    </Checkbox>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={styles.warningTextStyle}>
                {t('pricesAreMandatory') || '* Prices are mandatory for all variations'}
            </div>
        </div>
    );
};
