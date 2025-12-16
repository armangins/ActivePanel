import { memo } from 'react';
import { Skeleton, theme } from 'antd';

/**
 * ProductListTableSkeleton Component
 * 
 * Skeleton loading placeholder for ProductListTable
 * Shows animated placeholders while products are loading
 */
const ProductListTableSkeleton = memo(({ count = 16 }) => {
  const { token } = theme.useToken();

  const containerStyle = {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorderSecondary}`,
    overflow: 'hidden'
  };

  const headerCellStyle = {
    padding: '12px 16px',
    backgroundColor: token.colorFillQuaternary,
    borderBottom: `1px solid ${token.colorBorderSecondary}`
  };

  const cellStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${token.colorBorderSecondary}`
  };

  return (
    <div style={containerStyle}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* Header Skeleton */}
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, width: 48, textAlign: 'center' }}>
                <Skeleton.Button active size="small" style={{ width: 16, height: 16 }} />
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>
                <Skeleton.Input active size="small" style={{ width: 100, height: 16 }} />
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>
                <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>
                <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>
                <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'right' }}>
                <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
              </th>
              <th style={{ ...headerCellStyle, width: 64 }}></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, index) => (
              <tr key={`skeleton-row-${index}`}>
                {/* Checkbox */}
                <td style={{ ...cellStyle, textAlign: 'center' }}>
                  <Skeleton.Button active size="small" style={{ width: 16, height: 16 }} />
                </td>
                {/* Product */}
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Skeleton.Button active style={{ width: 48, height: 48, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton.Input active size="small" style={{ width: '75%', height: 16, marginBottom: 8 }} />
                      <Skeleton.Input active size="small" style={{ width: '50%', height: 12 }} />
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td style={cellStyle}>
                  <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
                </td>
                {/* Price */}
                <td style={cellStyle}>
                  <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
                </td>
                {/* Sale Price */}
                <td style={cellStyle}>
                  <Skeleton.Input active size="small" style={{ width: 50, height: 16 }} />
                </td>
                {/* Stock */}
                <td style={cellStyle}>
                  <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
                </td>
                {/* Actions */}
                <td style={cellStyle}>
                  <Skeleton.Button active size="small" style={{ width: 24, height: 24 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ProductListTableSkeleton.displayName = 'ProductListTableSkeleton';

export default ProductListTableSkeleton;

