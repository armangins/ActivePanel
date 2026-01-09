import './polyfills';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { LanguageProvider } from './contexts/LanguageContext'
import { AntdProvider } from './providers/AntdProvider'



// Global suppression of browser extension console errors
// Override console.error to filter out extension-related errors
const originalConsoleError = console.error;
console.error = function (...args) {
  // Convert all arguments to strings to check for extension-related content
  const errorString = args.join(' ');

  // Filter out errors from browser extensions
  if (
    errorString.includes('content_script') ||
    errorString.includes('extension') ||
    (errorString.includes('Cannot read properties of undefined') && errorString.includes('control'))
  ) {
    // Silently ignore these errors
    return;
  }

  // Pass through all other errors
  originalConsoleError.apply(console, args);
};

// Also override window.onerror to catch uncaught errors
const originalOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (source && source.includes('content_script')) {
    return true; // Prevent default error handling
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryProvider>
      <LanguageProvider>
        <AntdProvider>
          <App />
        </AntdProvider>
      </LanguageProvider>
    </QueryProvider>
  </React.StrictMode>,
)



