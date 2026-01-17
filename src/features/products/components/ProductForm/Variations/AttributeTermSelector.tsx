import React from 'react';
import { Form, Spin, Input, Tag, Space, theme } from 'antd';
import { useAttributeTerms } from '@/hooks/useAttributes';
import { useVariationStyles } from './styles';
import { useLanguage } from '@/contexts/LanguageContext';


const { CheckableTag } = Tag;
interface AttributeTermSelectorProps {
    attribute: any;
    form: any;
    onSelect: (attrName: string, term: string, label?: string) => void;
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
    console.log('🎨 AttributeTermSelector RENDERED:', {
        attributeName: attribute?.name,
        attributeId: attribute?.id,
        attributeType: attribute?.type
    });

    const { data: terms, isLoading } = useAttributeTerms(attribute.id);
    const { noOptionsStyle } = useVariationStyles();
    const { token } = theme.useToken();
    const { t } = useLanguage();
    const formValue = Form.useWatch(attribute ? attribute.name : '', form);

    const options = React.useMemo(() => {
        if (terms && terms.length > 0) {
            return terms.map((t: any) => ({
                label: t.name,
                value: t.name, // CRITICAL FIX: Use name, not slug, to prevent WC duplicates
                slug: t.slug,
                color: t.color, // Color hex value for color-type attributes
                image: t.image  // Image URL for image-type attributes
            }));
        }
        return (attribute.options || []).map((opt: string) => ({ label: opt, value: opt }));
    }, [terms, attribute.options]);

    if (isLoading) return <Spin size="small" />;

    if (!options || options.length === 0) {
        return (
            <div style={noOptionsStyle}>
                {t('noOptionsAvailable')}
            </div>
        );
    }

    const isImageAttribute = attribute.type === 'image';

    return (
        <div>
            {mode === 'single' && form && (
                <Form.Item name={attribute.name} noStyle>
                    <Input type="hidden" />
                </Form.Item>
            )}

            <Space size={[8, 8]} wrap>
                {options.map((option: { label: string; value: string; color?: string; image?: string; slug?: string }) => {
                    const isSelected = mode === 'single' ? formValue === option.value : selectedValues.includes(option.value);

                    return (
                        <CheckableTag
                            key={option.value}
                            checked={isSelected}
                            onChange={() => onSelect(attribute.name, option.value, option.label)}
                            style={{
                                border: `2px solid ${isSelected ? token.colorPrimary : token.colorBorder}`,
                                padding: `${token.paddingXXS}px ${token.paddingSM}px`,
                                fontSize: token.fontSize,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                borderRadius: token.borderRadius,
                                height: 'auto'
                            }}
                        >
                            {isImageAttribute && option.image && (
                                <img
                                    src={option.image}
                                    alt={option.label}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        flexShrink: 0
                                    }}
                                />
                            )}
                            {option.label}
                        </CheckableTag>
                    );
                })}
            </Space>
        </div>
    );
};
