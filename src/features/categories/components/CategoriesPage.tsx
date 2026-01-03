import { useState } from 'react';
import { Layout, Typography, Button, Input, Empty, Modal, theme, Flex } from 'antd';
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
    const { token } = theme.useToken();
    const [modal, contextHolder] = Modal.useModal();

    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const { data: categories = [], isLoading } = useCategoriesData({
        per_page: 100,
        search: debouncedSearch
    });

    const deleteMutation = useDeleteCategory();

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        modal.confirm({
            title: t('deleteCategoryConfirmTitle'),
            content: t('deleteCategoryConfirmContent'),
            okText: t('delete'),
            okType: 'danger',
            cancelText: t('cancel'),
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleAddClick = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    return (
        <Content style={{ padding: token.paddingLG, minHeight: 280, direction: isRTL ? 'rtl' : 'ltr' }}>
            {contextHolder}
            <Flex justify="space-between" align="center" style={{ marginBottom: token.marginLG }}>
                <Title level={2} style={{ margin: 0 }}>
                    {t('categories')}
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddClick}
                >
                    {t('addCategory')}
                </Button>
            </Flex>

            <Input
                placeholder={t('searchCategories')}
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: token.marginLG, maxWidth: 400 }}
                allowClear
            />

            {!isLoading && categories.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('noCategories')}
                >
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>
                        {t('createFirstCategory')}
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
