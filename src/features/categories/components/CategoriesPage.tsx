import { useState } from 'react';
import { Layout, Typography, Button, Input, Empty } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoriesData, useDeleteCategory } from '../hooks/useCategoriesData';
import CategoriesTable from './CategoriesTable';
import CategoryModal from './CategoryModal';
import { Category } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

const { Content } = Layout;
const { Title } = Typography;

export const CategoriesPage = () => {
    const { t, isRTL } = useLanguage();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const { data: categories = [], isLoading } = useCategoriesData({
        per_page: 100, // Fetch all for clientside filtering if needed, or implement server search
        search: debouncedSearch
    });

    const deleteMutation = useDeleteCategory();

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm(t('deleteCategoryConfirm') || 'Are you sure you want to delete this category?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    return (
        <Content style={{ padding: 24, minHeight: 280, direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>
                    {t('categories') || 'Categories'}
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setSelectedCategory(null);
                        setIsModalOpen(true);
                    }}
                >
                    {t('addCategory') || 'Add Category'}
                </Button>
            </div>

            <Input
                placeholder={t('searchCategories') || 'Search categories...'}
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 24, maxWidth: 400 }}
                allowClear
            />

            {!isLoading && categories.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('noCategories') || 'No categories found'}
                >
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>
                        {t('createFirstCategory') || 'Create your first category'}
                    </Button>
                </Empty>
            ) : (
                <CategoriesTable
                    categories={categories}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {isModalOpen && (
                <CategoryModal
                    open={isModalOpen}
                    onClose={handleModalClose}
                    category={selectedCategory}
                />
            )}
        </Content>
    );
};

export default CategoriesPage;
