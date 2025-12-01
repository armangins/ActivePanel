import { XMarkIcon as X } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

/**
 * Modal Component
 * 
 * Reusable modal/dialog component.
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Function to call when closing
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full' (default: 'md')
 * @param {boolean} closeOnOverlayClick - Whether to close when clicking overlay (default: true)
 * @param {boolean} showCloseButton - Whether to show close button (default: true)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-0 sm:p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-[100]"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Panel - Full screen on mobile, centered on desktop */}
      <div 
        className={`relative bg-white text-right overflow-hidden shadow-xl transform transition-all w-full h-full sm:h-auto sm:rounded-lg z-[101] ${sizeClasses[size]} ${size === 'full' ? '' : 'sm:max-h-[90vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
