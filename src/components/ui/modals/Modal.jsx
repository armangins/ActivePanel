import { Modal as AntModal } from 'antd';

/**
 * Modal Component - Ant Design wrapper
 * 
 * Reusable modal/dialog component using Ant Design Modal.
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  title,
  footer,
  ...props
}) => {
  const sizeMap = {
    sm: 520,
    md: 800,
    lg: 1200,
    xl: 1600,
    full: '100%',
  };

  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      onOk={onClose}
      title={title}
      footer={footer}
      width={sizeMap[size] || sizeMap.md}
      maskClosable={closeOnOverlayClick}
      closable={showCloseButton}
      {...props}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
