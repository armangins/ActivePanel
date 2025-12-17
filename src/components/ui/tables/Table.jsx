import { Table as AntTable } from 'antd';

/**
 * Table Component - Ant Design wrapper
 * 
 * Reusable table container component using Ant Design Table.
 * 
 * Note: Ant Design Table uses a different API (columns + dataSource).
 * For backward compatibility, this wrapper accepts children but recommends
 * using columns and dataSource props directly.
 */
const Table = ({ children, className = '', columns, dataSource, ...props }) => {
  // If columns and dataSource are provided, use Ant Design Table directly
  if (columns && dataSource) {
    return (
      <AntTable
        columns={columns}
        dataSource={dataSource}
        className={className}
        {...props}
      />
    );
  }

  // Otherwise, render children (for backward compatibility during migration)
  return (
    <div className={className}>
      <AntTable {...props}>
        {children}
      </AntTable>
    </div>
  );
};

export default Table;



