import React from 'react';
import { Select, Tag, Card } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { AttributeTermSelector } from './AttributeTermSelector';
import { useVariationStyles } from './styles';

interface VariationWizardStepProps {
    globalAttributes: any[];
    activeAttributeIds: number[];
    setActiveAttributeIds: React.Dispatch<React.SetStateAction<number[]>>;
    wizardAttributes: Record<number, string[]>;
    onAttributeValueSelect: (attrId: number, value: string) => void;
    form: any;
}

export const VariationWizardStep: React.FC<VariationWizardStepProps> = ({
    globalAttributes,
    activeAttributeIds,
    setActiveAttributeIds,
    wizardAttributes,
    onAttributeValueSelect,
    form
}) => {
    const { t } = useLanguage();
    const styles = useVariationStyles();

    return (
        <div style={styles.stepContentStyle}>
            <div style={styles.stepsContainerStyle}>
                <div style={styles.selectorLabelStyle}>1. {t('selectAttributes')}</div>
                <div style={styles.wizardInstructionStyle}>בחרו את התכונות שתרצו להצמיד למוצר לדוגמה (צבע,מידה וכו)</div>
                <Select
                    placeholder={t('searchOrSelectAttributes')}
                    style={{ width: '100%', marginBottom: 12 }}
                    mode="multiple"
                    optionLabelProp="label"
                    value={activeAttributeIds}
                    onChange={(vals) => setActiveAttributeIds(vals)}
                    options={globalAttributes.map((attr: any) => ({
                        label: attr.name,
                        value: attr.id,
                        key: attr.id
                    }))}
                />
                <div style={styles.tagsContainerStyle}>
                    {activeAttributeIds.map(id => {
                        const attr = globalAttributes.find((a: any) => a.id === id);
                        return attr ? (
                            <Tag
                                key={id}
                                closable
                                onClose={() => setActiveAttributeIds(prev => prev.filter(pid => pid !== id))}
                                color="blue"
                                style={{ fontSize: 13, padding: '4px 10px' }}
                            >
                                {attr.name}
                            </Tag>
                        ) : null;
                    })}
                </div>
            </div>

            <div style={styles.cardsContainerStyle}>
                {activeAttributeIds.map(id => {
                    const attr = globalAttributes.find((a: any) => a.id === id);
                    if (!attr) return null;
                    const selectedCount = wizardAttributes[id]?.length || 0;

                    return (
                        <Card
                            key={id}
                            title={
                                <div style={styles.cardHeaderStyle}>
                                    <span>{attr.name}</span>
                                </div>
                            }
                            extra={<span style={styles.cardExtraStyle}>{selectedCount} {t('valuesAdded')}</span>}
                            size="small"
                            type="inner"
                        >
                            <div style={styles.wizardInstructionStyle}>{t('variationValuesInstruction')}</div>
                            <AttributeTermSelector
                                attribute={attr}
                                form={form}
                                onSelect={(_, val) => onAttributeValueSelect(id, val)}
                                selectedValues={wizardAttributes[id] || []}
                                mode="multiple"
                            />
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
