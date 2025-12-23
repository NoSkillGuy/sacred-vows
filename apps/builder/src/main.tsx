import 'zone.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ToastProvider } from './components/Toast/ToastProvider';
import { queryClient } from './lib/queryClient';
import { initObservability } from './lib/observability';
import { ObservabilityRouter } from './lib/observabilityRouter';
import './styles/index.css';
// Invitation styles are loaded in PreviewPane to avoid conflicts with builder UI

// Initialize observability before React render
initObservability();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ObservabilityRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ObservabilityRouter>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

