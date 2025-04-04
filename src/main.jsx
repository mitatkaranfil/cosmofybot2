import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { WebApp } from '@twa-dev/sdk';

// Initialize Telegram WebApp
WebApp.ready();

// Set theme based on Telegram theme
document.documentElement.className = WebApp.colorScheme;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 