import React from 'react';
import { Form, Spin, Input, Tag, Space, theme } from 'antd';
import { useAttributeTerms } from '@/hooks/useAttributes';
import { useVariationStyles } from './styles';
import { useLanguage } from '@/contexts/LanguageContext';

const { CheckableTag } = Tag;

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
    const { noOptionsStyle } = useVariationStyles();
    const { token } = theme.useToken();
    const { t } = useLanguage();
    const formValue = Form.useWatch(attribute ? attribute.name : '', form);

    if (isLoading) return <Spin size="small" />;

    const options = terms && terms.length > 0 ? terms.map((t: any) => t.name) : (attribute.options || []);

    if (!options || options.length === 0) {
        return (
            <div style={noOptionsStyle}>
                {t('noOptionsAvailable')}
            </div>
        );
    }

    return (
        <div>
            {mode === 'single' && form && (
                <Form.Item name={attribute.name} noStyle>
                    <Input type="hidden" />
                </Form.Item>
            )}

            <Space size={[8, 8]} wrap>
                {options.map((option: string) => {
                    const isSelected = mode === 'single' ? formValue === option : selectedValues.includes(option);
                    return (
                        <CheckableTag
                            key={option}
                            checked={isSelected}
                            onChange={() => onSelect(attribute.name, option)}
                            style={{
                                border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorder}`,
                                padding: `${token.paddingXXS}px ${token.paddingSM}px`,
                                fontSize: token.fontSize
                            }}
                        >
                            {option}
                        </CheckableTag>
                    );
                })}
            </Space>
        </div>
    );
};
