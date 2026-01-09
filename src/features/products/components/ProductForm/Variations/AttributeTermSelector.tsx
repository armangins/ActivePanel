import React from 'react';
import { Form, Spin, Input } from 'antd';
import { useAttributeTerms } from '@/hooks/useAttributes';
import { useVariationStyles } from './styles';

interface AttributeTermSelectorProps {
    attribute: any;
    form: any;
    onSelect: (attrName: string, term: string) => void;
    selectedValues?: string[];
    mode?: 'single' | 'multiple';
}

export const AttributeTermSelector: React.FC<AttributeTermSelectorProps> = ({
    attribute,
    form,
    onSelect,
    selectedValues = [],
    mode = 'single'
}) => {
    const { data: terms, isLoading } = useAttributeTerms(attribute.id);
    const { termSelectorContainerStyle, termOptionStyle, noOptionsStyle } = useVariationStyles();
    const formValue = Form.useWatch(attribute ? attribute.name : '', form);

    if (isLoading) return <Spin size="small" />;

    const options = terms && terms.length > 0 ? terms.map((t: any) => t.name) : (attribute.options || []);

    if (!options || options.length === 0) {
        return (
            <div style={noOptionsStyle}>
                {form?.t ? form.t('noOptionsAvailable') : 'No options available'}
            </div>
        );
    }

    return (
        <div style={termSelectorContainerStyle}>
            {mode === 'single' && form && (
                <Form.Item name={attribute.name} noStyle>
                    <Input type="hidden" />
                </Form.Item>
            )}

            {options.map((option: string) => {
                const isSelected = mode === 'single' ? formValue === option : selectedValues.includes(option);
                return (
                    <div
                        key={option}
                        onClick={() => onSelect(attribute.name, option)}
                        style={termOptionStyle(isSelected)}
                    >
                        {isSelected && <span style={{ fontSize: 12 }}>✓</span>}
                        {option}
                    </div>
                );
            })}
        </div>
    );
};
