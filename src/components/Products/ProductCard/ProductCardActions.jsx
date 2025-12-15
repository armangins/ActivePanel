import { DeleteOutlined as Trash2Icon, EditOutlined as MoveLeftIcon } from '@ant-design/icons';

const ProductCardActions = ({
    onEdit,
    onDelete,
    editLabel,
    deleteLabel,
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'stretch',
            paddingTop: '8px', 
            marginTop: 'auto', 
            width: '100%',
            borderTop: '1px solid #e0e0e0',
            minHeight: '48px'
        }}>
            {/* Edit Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(e);
                }}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease',
                    height: '100%',
                    minHeight: '48px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={editLabel}
            >
                <MoveLeftIcon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>עריכה</span>
            </button>

            {/* Vertical Separator */}
            <div style={{
                width: '1px',
                backgroundColor: '#e0e0e0',
                alignSelf: 'stretch',
                flexShrink: 0
            }} />

            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(e);
                }}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease',
                    height: '100%',
                    minHeight: '48px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={deleteLabel}
            >
                <Trash2Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>מחיקה</span>
            </button>
        </div>
    );
};

export default ProductCardActions;
