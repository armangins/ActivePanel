import React from 'react';

const FiltersModalCategory = ({ selectedCategory, onCategoryChange, categories, t }) => {
    return (
        <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2`} style={{ textAlign: 'right' }}>
                {t('category')}
            </label>
            <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={`input-field w-full text-right`}
                dir="rtl"
            >
                <option value="">{t('allCategories')}</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                        {category.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FiltersModalCategory;
