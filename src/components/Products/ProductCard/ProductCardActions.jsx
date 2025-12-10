import { Trash2Icon, MoveLeftIcon } from '../../icons';
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
                    className="h-10 px-3 !text-primary-500 !hover:bg-primary-50 border border-gray-200 flex items-center gap-2"
                    title={editLabel}
                    variant="ghost"
                >
                    <MoveLeftIcon className="w-5 h-5" />
                    <span className="font-medium">עריכה</span>
                </Button>
                <Button
                    onClick={onDelete}
                    className="w-10 h-10 !text-orange-600 !hover:bg-orange-50 border border-gray-200"
                    title={deleteLabel}
                    variant="ghost"
                    size="icon"
                >
                    <Trash2Icon className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default ProductCardActions;
