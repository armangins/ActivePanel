import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Toast Component
 * 
 * Displays a notification toast at the top-center that auto-dismisses after a specified duration
 * and fades in from top to bottom.
 * 
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'error', 'success', 'warning', 'info'
 * @param {number} duration - Duration in ms before auto-dismiss (default: 5000)
 * @param {function} onClose - Callback when toast is closed
 */
const Toast = ({ message, type = 'error', duration = 5000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Auto-dismiss after duration
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
            onClose?.();
        }, 300); // Match animation duration
    };

    const typeStyles = {
        error: 'bg-red-500 border-red-600',
        success: 'bg-green-500 border-green-600',
        warning: 'bg-orange-500 border-orange-600',
        info: 'bg-blue-500 border-blue-600',
    };

    return (
        <div
            className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[9999] 
        ${typeStyles[type]} 
        text-white px-6 py-4 rounded-lg shadow-lg border-l-4
        flex items-center gap-3 min-w-[400px] max-w-[600px]
        transition-all duration-300 ease-in-out
        ${isExiting
                    ? 'opacity-0 -translate-y-full -translate-x-1/2'
                    : 'opacity-100 translate-y-0 -translate-x-1/2'
                }
      `}
            role="alert"
        >
            <div className="flex-1 text-sm font-medium whitespace-pre-line text-right">
                {message}
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
                aria-label="Close"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;
