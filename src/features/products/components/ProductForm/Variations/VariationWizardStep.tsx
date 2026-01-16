import React from 'react';
import { Select, Button, Typography, theme, Flex } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { AttributeTermSelector } from './AttributeTermSelector';
import { useVariationStyles } from './styles';

interface VariationWizardStepProps {
    globalAttributes: any[];
    activeAttributeIds: (number | string)[];
    setActiveAttributeIds: React.Dispatch<React.SetStateAction<(number | string)[]>>;
    wizardAttributes: Record<number | string, string[]>;
    onAttributeValueSelect: (attrId: number | string, value: string) => void;
    form: any;
    existingAttributes?: any[];
}

export const VariationWizardStep: React.FC<VariationWizardStepProps> = ({
    globalAttributes,
    activeAttributeIds,
    setActiveAttributeIds,
    wizardAttributes,
    onAttributeValueSelect,
    form,
    existingAttributes = []
}) => {
    const { t } = useLanguage();
    const styles = useVariationStyles();
    const { token } = theme.useToken();

    // Helper to find attribute by ID from either source
    const getAttribute = (id: number | string) => {
        return globalAttributes.find((a: any) => a.id === id) ||
            existingAttributes.find((a: any) => (a.id === id) || (a.id === 0 && a.name === id));
    };

    // Combine attributes for the dropdown
    const availableAttributes = React.useMemo(() => {
        const combined = [...globalAttributes];
        existingAttributes.forEach(attr => {
            if (!combined.find(c => c.id === attr.id)) {
                combined.push(attr);
            }
        });
        return combined;
    }, [globalAttributes, existingAttributes]);

    return (
        <div style={styles.stepContentStyle}>
            {/* Header / Instruction */}
            <div style={{ marginBottom: token.marginLG }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                    {t('selectAttributes')}
                </Typography.Title>
                <Typography.Text type="secondary">
                    {t('variationGeneratorDesc')}
                </Typography.Text>
            </div>

            {/* Main Selector for Adding Attributes */}
            <div style={{ marginBottom: token.marginLG }}>
                <div style={{ marginBottom: token.marginXS }}>
                    <Typography.Text strong>
                        {t('selectAttributesFirst')}
                    </Typography.Text>
                </div>
                <Select
                    placeholder={t('searchOrSelectAttributes')}
                    style={{ width: '100%', maxWidth: 400 }}
                    mode="multiple"
                    optionLabelProp="label"
                    value={activeAttributeIds}
                    onChange={(vals) => setActiveAttributeIds(vals)}
                    options={availableAttributes.map((attr: any) => {
                        const safeValue = attr.id > 0 ? attr.id : attr.name;
                        return {
                            label: attr.name,
                            value: safeValue,
                            key: safeValue
                        };
                    })}
                />
            </div>

            {/* List of Rows for Each Selected Attribute */}
            <Flex vertical gap={token.margin}>
                {activeAttributeIds.map((id) => {
                    const attr = getAttribute(id);
                    if (!attr) return null;

                    return (
                        <Flex
                            key={id}
                            align="center"
                            gap={token.margin}
                            style={{
                                padding: token.padding,
                                background: token.colorFillQuaternary,
                                borderRadius: token.borderRadius,
                                border: `1px solid ${token.colorBorderSecondary}`
                            }}
                        >
                            {/* Attribute Name Column */}
                            <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {attr.name}
                            </div>

                            {/* Value Selector Column */}
                            <div style={{ flex: 1 }}>
                                <AttributeTermSelector
                                    attribute={attr}
                                    form={form}
                                    mode="multiple"
                                    selectedValues={wizardAttributes[id] || []}
                                    onSelect={(_, value) => onAttributeValueSelect(id, value)}
                                />
                            </div>

                            {/* Remove Action */}
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => setActiveAttributeIds(prev => prev.filter(pid => pid !== id))}
                            />
                        </Flex>
                    );
                })}

                {activeAttributeIds.length === 0 && (
                    <div style={{
                        padding: token.paddingXL,
                        textAlign: 'center',
                        color: token.colorTextTertiary,
                        background: token.colorFillQuaternary,
                        borderRadius: token.borderRadius
                    }}>
                        {t('noAttributesSelected')}
                    </div>
                )}
            </Flex>
        </div>
    );
};
