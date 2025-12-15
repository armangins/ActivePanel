import { message as antdMessage } from 'antd';

/**
 * Toast Component - Ant Design wrapper
 * 
 * Displays notifications using Ant Design message API.
 * This is a utility function wrapper, not a component.
 */
export const Toast = ({ message: msg, type = 'error', duration = 5000, onClose }) => {
  const messageType = type === 'error' ? 'error' : 
                      type === 'success' ? 'success' : 
                      type === 'warning' ? 'warning' : 'info';
  
  antdMessage[messageType](msg, duration / 1000);
  
  if (onClose) {
    setTimeout(() => {
      onClose();
    }, duration);
  }
};

export default Toast;
