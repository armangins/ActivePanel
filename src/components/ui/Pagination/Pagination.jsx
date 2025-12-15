import { Pagination as AntPagination } from 'antd';

/**
 * Pagination Component - Ant Design wrapper
 * 
 * Reusable numbered pagination component using Ant Design Pagination.
 */
const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    isRTL,
    t
}) => {
    if (totalPages <= 1) return null;

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px',
            marginTop: '24px'
        }}>
            <div style={{ color: '#666', fontSize: '14px' }}>
                {t('showing') || 'Showing'} <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> {t('to') || 'to'} <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> {t('of') || 'of'} <strong>{totalItems}</strong> {t('results') || 'results'}
            </div>
            <AntPagination
                current={currentPage}
                total={totalItems}
                pageSize={itemsPerPage}
                onChange={onPageChange}
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total, range) => null} // We show custom total above
            />
        </div>
    );
};

export default Pagination;
