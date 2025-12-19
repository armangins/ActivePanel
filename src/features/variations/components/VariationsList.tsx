import { Spin, Empty } from 'antd';
import { Variation } from '../types';
import { VariationCard } from './VariationCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface VariationsListProps {
    variations: Variation[];
    isLoading: boolean;
    onEdit: (variation: Variation) => void;
    onDelete: (variation: Variation) => void;
}

export const VariationsList = ({ variations, isLoading, onEdit, onDelete }: VariationsListProps) => {
    const { t } = useLanguage();

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>;
    }

    if (!variations.length) {
        return <Empty description={t('noVariations') || 'No variations found'} />;
    }

    return (
        <div>
            {variations.map(variation => (
                <VariationCard
                    key={variation.id}
                    variation={variation}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
