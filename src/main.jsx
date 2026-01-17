import './polyfills';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryProvider } from './providers/QueryProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AntdProvider } from './providers/AntdProvider'
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary'
import { setupConsoleErrors } from '@/utils/consoleConfig'

// Initialize console error suppression
setupConsoleErrors();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <LanguageProvider>
          <AntdProvider>
            <App />
          </AntdProvider>
        </LanguageProvider>
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)



