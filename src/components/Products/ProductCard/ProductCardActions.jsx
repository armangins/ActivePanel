import { Button, theme } from 'antd';
import { DeleteOutlined as Trash2Icon, EditOutlined as MoveLeftIcon } from '@ant-design/icons';

const ProductCardActions = ({
    onEdit,
    onDelete,
    editLabel,
    deleteLabel,
}) => {
    const { token } = theme.useToken();

    return (
        <div style={{
            display: 'flex',
            marginTop: 'auto',
            width: '100%',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}>
            {/* Edit Button */}
            <Button
                type="text"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(e);
                }}
                style={{
                    flex: 1,
                    borderRadius: 0,
                    height: '48px',
                    color: token.colorPrimary,
                    fontWeight: 500
                }}
                icon={<MoveLeftIcon />}
            >
                {editLabel || 'עריכה'}
            </Button>

            {/* Vertical Separator */}
            <div style={{
                width: '1px',
                backgroundColor: token.colorBorderSecondary,
            }} />

            {/* Delete Button */}
            <Button
                type="text"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(e);
                }}
                style={{
                    flex: 1,
                    borderRadius: 0,
                    height: '48px',
                    color: token.colorPrimary,
                    fontWeight: 500
                }}
                icon={<Trash2Icon />}
            >
                {deleteLabel || 'מחיקה'}
            </Button>
        </div>
    );
};

export default ProductCardActions;
