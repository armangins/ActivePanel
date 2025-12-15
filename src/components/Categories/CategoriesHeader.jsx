import { PlusOutlined as Plus } from '@ant-design/icons';
import { SearchInput } from '../ui/inputs';
import { Button } from '../ui';
import { Row, Col, Typography } from 'antd';
const { Text } = Typography;

const CategoriesHeader = ({ searchQuery, onSearchChange, onAddClick, displayedCount, totalCount, isRTL, t }) => {
  return (
    <Row gutter={[16, 16]} justify="space-between" align="middle">
      <Col xs={24} sm={12}>
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchCategories') || 'Search categories...'}
          isRTL={isRTL}
        />
      </Col>

      <Col xs={24} sm={12}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Text type="secondary" style={{ fontSize: 14, textAlign: isRTL ? 'right' : 'left' }}>
            {displayedCount} {displayedCount === 1 ? (t('category') || 'category') : (t('categories') || 'categories')}
            {searchQuery && ` / ${totalCount} ${t('total') || 'total'}`}
          </Text>

          <Button
            onClick={onAddClick}
            variant="primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <Plus />
            <span>{t('addCategory') || 'Add Category'}</span>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default CategoriesHeader;











