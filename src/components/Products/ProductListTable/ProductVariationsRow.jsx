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
        <tr className="bg-gray-50">
            <td colSpan="6" className="p-4">
                <div className="pl-12 pr-4 flex flex-col items-start">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        {t('variations') || 'Variations'}
                    </h4>
                    <div className="w-full">
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
            </td>
        </tr>
    );
};

export default ProductVariationsRow;
