import React from 'react';
import { TrashIcon as Trash2, PencilIcon as Edit } from '@heroicons/react/24/outline';
import { Button } from '../../ui';

const ProductCardActions = ({
    onEdit,
    onDelete,
    editLabel,
    deleteLabel,
}) => {
    return (
        <div className="flex pt-2 mt-auto w-full justify-start">
            <div className={`flex flex-row-reverse gap-2`}>
                <Button
                    onClick={onEdit}
                    className="w-10 h-10 !text-primary-500 !hover:bg-primary-50 border border-gray-200"
                    title={editLabel}
                    variant="ghost"
                    size="icon"
                >
                    <Edit className="w-5 h-5" />
                </Button>
                <Button
                    onClick={onDelete}
                    className="w-10 h-10 !text-orange-600 !hover:bg-orange-50 border border-gray-200"
                    title={deleteLabel}
                    variant="ghost"
                    size="icon"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default ProductCardActions;
