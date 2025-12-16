import { MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Dropdown, theme } from 'antd';

/**
 * ActionsCell Component
 * 
 * Displays action menu (ellipsis) with Edit and Delete options using Ant Design Dropdown.
 */
const ActionsCell = ({
  product,
  onEdit,
  onDelete,
  t
}) => {
  const { token } = theme.useToken();

  const handleEdit = ({ domEvent }) => {
    domEvent.stopPropagation();
    onEdit && onEdit(product);
  };

  const handleDelete = ({ domEvent }) => {
    domEvent.stopPropagation();
    onDelete && onDelete(product);
  };

  const items = [
    {
      key: 'edit',
      label: t('edit') || 'Edit',
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: 'delete',
      label: t('removeProduct') || t('deleteProduct'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <div style={{ padding: '12px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <Button
          type="text"
          shape="circle"
          icon={<MoreOutlined style={{ fontSize: 18, color: token.colorTextSecondary }} />}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};

export default ActionsCell;
