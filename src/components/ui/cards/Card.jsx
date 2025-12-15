import { Card as AntCard } from 'antd';

/**
 * Card Component - Ant Design wrapper
 * 
 * Reusable card container component using Ant Design Card.
 */
const Card = ({ children, className = '', onClick, hover = false, ...props }) => {
  return (
    <AntCard
      hoverable={hover || !!onClick}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default Card;


