import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { WebApp } from '@twa-dev/sdk';

// Check if we're running inside Telegram WebApp
const isTelegramWebApp = Boolean(window.Telegram?.WebApp);

// Initialize Telegram WebApp if available
if (isTelegramWebApp) {
  WebApp.ready();
  
  // Set theme based on Telegram theme
  document.documentElement.className = WebApp.colorScheme;
} else {
  // Default theme for browser testing
  document.documentElement.className = 'light';
  console.log('Not running in Telegram WebApp - some features may be limited');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 