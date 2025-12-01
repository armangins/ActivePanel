import { useState, useEffect, useRef } from 'react';
import { TrashIcon as Trash2, PencilIcon as Edit, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DeleteConfirmModal from './DeleteConfirmModal';

/**
 * ActionsCell Component
 * 
 * Displays action menu (ellipsis) with Edit and Delete options.
 * Handles dropdown menu open/close state and positioning.
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isActionMenuOpen - Whether the menu is currently open
 * @param {Function} onActionMenuToggle - Callback to toggle menu state
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ActionsCell = ({
  product,
  isActionMenuOpen,
  onActionMenuToggle,
  onEdit,
  onDelete,
  isRTL,
  t
}) => {
  const menuRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isActionMenuOpen) {
          onActionMenuToggle(product.id);
        }
      }
    };

    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionMenuOpen, onActionMenuToggle, product.id]);

  const handleEdit = (e) => {
    e.stopPropagation();
    onActionMenuToggle(product.id);
    onEdit && onEdit(product);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onActionMenuToggle(product.id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete && onDelete(product.id);
  };

  return (
    <div className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
      <div className="relative flex justify-center" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionMenuToggle(product.id);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          aria-label={t('actions')}
        >
          <EllipsisVerticalIcon className="w-[18px] h-[18px]" />
        </button>

        {/* Action Menu Dropdown */}
        {isActionMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => onActionMenuToggle(product.id)}
            />
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={handleEdit}
                className={`w-full ${'text-right'} px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 ${'flex-row-reverse'}`}
              >
                <Edit className="w-4 h-4" />
                {t('editProduct')}
              </button>
              <button
                onClick={handleDeleteClick}
                className={`w-full ${'text-right'} px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 ${'flex-row-reverse'}`}
              >
                <Trash2 className="w-4 h-4" />
                {t('removeProduct') || t('deleteProduct')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={product.name}
        isRTL={isRTL}
        t={t}
      />
    </div>
  );
};

export default ActionsCell;

