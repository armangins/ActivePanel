import React, { useState, useEffect } from 'react';
import { Slider, Typography, Flex, InputNumber, theme } from 'antd';

const { Text } = Typography;

const FiltersModalPriceRange = ({
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
    actualMin,
    actualMax,
    t,
    isRTL
}) => {
    const { token } = theme.useToken();

    // Antd Slider uses [min, max] array
    const [range, setRange] = useState([actualMin, actualMax]);

    useEffect(() => {
        const start = minPrice !== '' ? parseFloat(minPrice) : actualMin;
        const end = maxPrice !== '' ? parseFloat(maxPrice) : actualMax;
        setRange([start, end]);
    }, [minPrice, maxPrice, actualMin, actualMax]);

    const handleSliderChange = (value) => {
        setRange(value);
    };

    const handleAfterChange = (value) => {
        onMinPriceChange(value[0]);
        onMaxPriceChange(value[1]);
    };

    return (
        <div style={{ textAlign: 'right' }}>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
                {t('priceRange') || t('price')}
            </Text>

            <Slider
                range
                min={actualMin}
                max={actualMax}
                value={range}
                onChange={handleSliderChange}
                onAfterChange={handleAfterChange}
                tooltip={{ formatter: (value) => `${value}` }}
                trackStyle={[{ backgroundColor: token.colorPrimary }]}
                handleStyle={[
                    { borderColor: token.colorPrimary, backgroundColor: token.colorBgContainer },
                    { borderColor: token.colorPrimary, backgroundColor: token.colorBgContainer }
                ]}
            />

            <Flex justify="space-between" align="center" style={{ marginTop: 16 }}>
                <Flex vertical align="center" gap={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t('minPrice')}</Text>
                    <Text strong>{range[0]}</Text>
                </Flex>

                <Text type="secondary">-</Text>

                <Flex vertical align="center" gap={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t('maxPrice')}</Text>
                    <Text strong>{range[1]}</Text>
                </Flex>
            </Flex>

            <Flex justify="space-between" style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>{actualMin}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{actualMax}</Text>
            </Flex>
        </div>
    );
};

export default FiltersModalPriceRange;
