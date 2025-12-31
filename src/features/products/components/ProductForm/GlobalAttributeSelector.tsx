import React from 'react';
import { Tag, Spin, Space, Typography, theme } from 'antd';
import { useAttributeTerms } from '@/hooks/useAttributeTerms';
import { CheckCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

interface AttributeTerm {
    id: number;
    name: string;
    slug: string;
    count?: number;
}

interface GlobalAttributeSelectorProps {
    attributeId: number;
    attributeName: string;
    selectedTerms: string[];
    onTermsChange: (newTerms: string[]) => void;
}

export const GlobalAttributeSelector = ({
    attributeId,
    attributeName,
    selectedTerms = [],
    onTermsChange
}: GlobalAttributeSelectorProps) => {
    const { token } = theme.useToken();

    // Fetch terms for this specific attribute
    const { data: terms = [], isLoading } = useAttributeTerms(attributeId);

    const toggleTerm = (termName: string, checked: boolean) => {
        const nextSelected = checked
            ? [...selectedTerms, termName]
            : selectedTerms.filter(t => t !== termName);
        onTermsChange(nextSelected);
    };

    if (isLoading) return <Spin size="small" />;

    // If no terms found for this attribute, show a small message or nothing
    if (terms.length === 0) return null;

    return (
        <div style={{ marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 15 }}>
                {attributeName}
            </Text>
            <Space size={[8, 8]} wrap>
                {(terms as AttributeTerm[]).map((term) => {
                    const isSelected = selectedTerms.includes(term.name);
                    return (
                        <Tag.CheckableTag
                            key={term.id}
                            checked={isSelected}
                            onChange={(checked) => toggleTerm(term.name, checked)}
                            style={{
                                fontSize: 14,
                                padding: '4px 12px',
                                borderRadius: 16,
                                border: isSelected ? `1px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
                                background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
                                color: isSelected ? token.colorPrimary : token.colorText,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isSelected && <CheckCircleFilled />}
                            {term.name}
                        </Tag.CheckableTag>
                    );
                })}
            </Space>
        </div>
    );
};
