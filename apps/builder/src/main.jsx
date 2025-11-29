import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
// Invitation styles are loaded in PreviewPane to avoid conflicts with builder UI

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

