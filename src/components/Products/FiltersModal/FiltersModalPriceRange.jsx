import React, { useState, useEffect } from 'react';

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
    // Use state for slider values - initialize with current filter values or range bounds
    const [sliderMin, setSliderMin] = useState(() => {
        return minPrice ? parseFloat(minPrice) : actualMin;
    });
    const [sliderMax, setSliderMax] = useState(() => {
        return maxPrice ? parseFloat(maxPrice) : actualMax;
    });

    // Update slider values when price range changes or filters are cleared
    useEffect(() => {
        if (minPrice === '') {
            setSliderMin(actualMin);
        } else {
            const numValue = parseFloat(minPrice);
            if (!isNaN(numValue)) {
                setSliderMin(numValue);
            }
        }
    }, [minPrice, actualMin]);

    useEffect(() => {
        if (maxPrice === '') {
            setSliderMax(actualMax);
        } else {
            const numValue = parseFloat(maxPrice);
            if (!isNaN(numValue)) {
                setSliderMax(numValue);
            }
        }
    }, [maxPrice, actualMax]);

    const handleMinPriceChange = (value) => {
        const numValue = parseFloat(value);
        if (numValue >= actualMin && numValue <= parseFloat(sliderMax)) {
            setSliderMin(value);
            onMinPriceChange(value);
        }
    };

    const handleMaxPriceChange = (value) => {
        const numValue = parseFloat(value);
        if (numValue <= actualMax && numValue >= parseFloat(sliderMin)) {
            setSliderMax(value);
            onMaxPriceChange(value);
        }
    };

    return (
        <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
                {t('priceRange') || t('price')}
            </label>

            {/* Range Sliders */}
            <div className="space-y-4">
                {/* Min Price Slider */}
                <div>
                    <div className={`flex items-center flex-row-reverse justify-between mb-2`}>
                        <span className="text-xs text-gray-500">{t('minPrice')}</span>
                        <span className="text-xs font-medium text-gray-700">{sliderMin}</span>
                    </div>
                    <input
                        type="range"
                        min={actualMin}
                        max={actualMax}
                        value={sliderMin}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 direction-rtl`}
                        dir="rtl"
                        style={{
                            background: isRTL
                                ? `linear-gradient(to left, #4560FF 0%, #4560FF ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb 100%)`
                                : `linear-gradient(to right, #4560FF 0%, #4560FF ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb ${((sliderMin - actualMin) / (actualMax - actualMin)) * 100}%, #e5e7eb 100%)`
                        }}
                    />
                </div>

                {/* Max Price Slider */}
                <div>
                    <div className={`flex items-center flex-row-reverse justify-between mb-2`}>
                        <span className="text-xs text-gray-500">{t('maxPrice')}</span>
                        <span className="text-xs font-medium text-gray-700">{sliderMax}</span>
                    </div>
                    <input
                        type="range"
                        min={actualMin}
                        max={actualMax}
                        value={sliderMax}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 direction-rtl`}
                        dir="rtl"
                        style={{
                            background: isRTL
                                ? `linear-gradient(to left, #e5e7eb 0%, #e5e7eb ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF 100%)`
                                : `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF ${((sliderMax - actualMin) / (actualMax - actualMin)) * 100}%, #4560FF 100%)`
                        }}
                    />
                </div>

                {/* Price Display */}
                <div className={`flex items-center flex-row-reverse justify-between text-sm text-gray-600 pt-2 border-t border-gray-200`}>
                    <span>{actualMin}</span>
                    <span className="font-medium text-gray-900">
                        {isRTL ? `${sliderMax} - ${sliderMin}` : `${sliderMin} - ${sliderMax}`}
                    </span>
                    <span>{actualMax}</span>
                </div>
            </div>
        </div>
    );
};

export default FiltersModalPriceRange;
