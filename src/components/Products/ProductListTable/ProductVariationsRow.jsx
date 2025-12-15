import { useVariations } from '../../../hooks/useVariations';
import { VariationsList } from '../../Variations';

/**
 * ProductVariationsRow Component
 * 
 * Renders a row containing the variations list for a variable product.
 * Fetches variations data automatically.
 */
const ProductVariationsRow = ({ product, formatCurrency, t, isRTL }) => {
    const {
        data: variationsData,
        isLoading,
        error
    } = useVariations(product.id, {
        enabled: !!product.id
    });

    const variations = variationsData?.data || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: 14, fontWeight: 500, color: '#595959', marginBottom: 12 }}>
                {t('variations') || 'Variations'}
            </h4>
            <div style={{ width: '100%' }}>
                <VariationsList
                    variations={variations}
                    loading={isLoading}
                    error={error?.message}
                    formatCurrency={formatCurrency}
                    t={t}
                    showActions={false}
                    emptyMessage={t('noVariations') || 'No variations found'}
                />
            </div>
        </div>
    );
};

export default ProductVariationsRow;
