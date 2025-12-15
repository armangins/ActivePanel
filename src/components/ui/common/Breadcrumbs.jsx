import { Breadcrumb as AntBreadcrumb } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * Breadcrumbs Component - Ant Design wrapper
 * 
 * A flexible breadcrumb navigation component using Ant Design Breadcrumb.
 */
const Breadcrumbs = ({ items = [], separator = '/', className = '' }) => {
  const { t } = useLanguage();

  if (!items || items.length === 0) {
    return null;
  }

  const breadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;
    
    // If item is a string, render as simple text
    if (typeof item === 'string') {
      return {
        title: item,
      };
    }

    // If item is an object with label
    const { label, onClick, href, className: itemClassName = '' } = item;
    
    return {
      title: label,
      href: href,
      onClick: onClick,
      className: itemClassName,
    };
  });

  return (
    <AntBreadcrumb
      items={breadcrumbItems}
      separator={separator}
      className={className}
    />
  );
};

export default Breadcrumbs;


