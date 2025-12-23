import { Card, Alert } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { VariationManager } from '@/features/variations';

interface AttributesTabProps {
    attributes: any[];
}

export const AttributesTab = ({ attributes }: AttributesTabProps) => {
    const { t } = useLanguage();

    return (
        <Card variant="borderless" title={t('attributes')}>
            <Alert
                message={t('attributesNotice') || "Manage global attributes in Products > Attributes. Local attributes support coming soon."}
                type="info"
                showIcon
            />
            <div style={{ marginTop: 16 }}>
                {attributes.length === 0 ? <p>{t('noAttributes')}</p> : (
                    <ul>
                        {attributes.map((attr: any) => (
                            <li key={attr.id}>{attr.name}: {attr.options.join(', ')}</li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};

interface VariationsTabProps {
    productId: number | null;
    productType: string;
    attributes: any[];
}

export const VariationsTab = ({ productId, productType, attributes }: VariationsTabProps) => {
    const { t } = useLanguage();

    return (
        <Card variant="borderless">
            {productId ? (
                productType === 'variable' ? (
                    <VariationManager productId={productId} attributes={attributes} />
                ) : (
                    <Alert
                        message={t('notVariableProduct') || "This is not a variable product. Change product type to Variable to manage variations."}
                        type="warning"
                        showIcon
                    />
                )
            ) : (
                <Alert
                    message={t('saveProductFirst') || "Please save the product before adding variations."}
                    type="info"
                    showIcon
                />
            )}
        </Card>
    );
};
