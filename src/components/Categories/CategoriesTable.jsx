import { EditOutlined as Edit, DeleteOutlined as Trash, AppstoreOutlined as BulkAssign, EyeOutlined as View } from '@ant-design/icons';
import { Table } from 'antd';
import { sanitizeHTML } from '../../utils/security';
import { Button } from '../ui';

const CategoriesTable = ({ categories, onEdit, onDelete, onBulkAssign, isRTL, t }) => {
  const columns = [
    {
      title: t('name') || 'Name',
      dataIndex: 'name',
      key: 'name',
      align: isRTL ? 'right' : 'left',
    },
    {
      title: t('slug') || 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      align: isRTL ? 'right' : 'left',
    },
    {
      title: t('description') || 'Description',
      dataIndex: 'description',
      key: 'description',
      align: isRTL ? 'right' : 'left',
      render: (text) => (
        <div
          style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(text || '-')
          }}
        />
      ),
    },
    {
      title: t('count') || 'Products',
      dataIndex: 'count',
      key: 'count',
      align: isRTL ? 'right' : 'left',
      render: (count) => count || 0,
    },
    {
      title: t('actions') || 'Actions',
      key: 'actions',
      align: isRTL ? 'right' : 'left',
      render: (_, category) => (
        <div style={{ display: 'flex', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onBulkAssign(category)}
            title={t('bulkAssign') || 'הקצאה מרובת מוצרים'}
          >
            <BulkAssign />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(category)}
            title={t('edit') || 'ערוך'}
          >
            <Edit />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(category.id)}
            danger
            title={t('delete') || 'מחק'}
          >
            <Trash />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled
            title={t('comingSoon') || 'בקרוב...'}
          >
            <View />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={categories}
      rowKey="id"
      pagination={false}
      scroll={{ x: true }}
    />
  );
};

export default CategoriesTable;
