import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesAPI } from '../../services/woocommerce';
import { useCategories } from '../../hooks/useCategories';
import CategoryModal from './CategoryModal';
import BulkAssignModal from './BulkAssignModal';
import CategoriesHeader from './CategoriesHeader';
import CategoriesTable from './CategoriesTable';
import { EmptyState, LoadingState, ErrorState } from '../ui';

const Categories = () => {
  const { t, isRTL } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState(null);

  // Use useCategories hook for data fetching with caching
  const {
    data: allCategories = [],
    isLoading: loading,
    error,
    refetch: loadCategories
  } = useCategories();

  // Filter categories by search query
  const filteredCategories = allCategories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name?.toLowerCase().includes(query) ||
      category.slug?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteCategory') || 'Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      await loadCategories(); // Reload categories
    } catch (err) {
      alert(t('error') + ': ' + err.message);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleBulkAssign = (category) => {
    setSelectedCategoryForBulk(category);
    setIsBulkAssignOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    loadCategories(); // Reload categories after add/edit
  };

  const handleBulkAssignClose = () => {
    setIsBulkAssignOpen(false);
    setSelectedCategoryForBulk(null);
  };

  if (loading) {
    return <LoadingState message={t('loadingCategories') || 'Loading categories...'} />;
  }

  if (error && !allCategories.length) {
    return <ErrorState error={error.message || t('error')} onRetry={loadCategories} fullPage />;
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <CategoriesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleAdd}
        displayedCount={filteredCategories.length}
        totalCount={allCategories.length}
        isRTL={isRTL}
        t={t}
      />

      {filteredCategories.length === 0 ? (
        <EmptyState
          message={searchQuery ? (t('noCategoriesFound') || 'No categories found') : (t('noCategories') || 'No categories')}
          isRTL={isRTL}
        />
      ) : (
        <CategoriesTable
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkAssign={handleBulkAssign}
          isRTL={isRTL}
          t={t}
        />
      )}

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleModalClose}
          isRTL={isRTL}
          t={t}
        />
      )}

      {/* Bulk Assign Modal */}
      {isBulkAssignOpen && selectedCategoryForBulk && (
        <BulkAssignModal
          category={selectedCategoryForBulk}
          onClose={handleBulkAssignClose}
          isRTL={isRTL}
          t={t}
        />
      )}
    </div>
  );
};

export default Categories;







