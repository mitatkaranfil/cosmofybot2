import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check if we're running inside Telegram WebApp environment
const isTelegramWebAppEnv = Boolean(window.Telegram?.WebApp);

// Initialize theme based on environment
if (isTelegramWebAppEnv) {
  try {
    // Use the native Telegram WebApp directly from window object
    window.Telegram.WebApp.ready();
    document.documentElement.className = window.Telegram.WebApp.colorScheme || 'light';
  } catch (error) {
    console.warn('Telegram WebApp error:', error);
    document.documentElement.className = 'light';
  }
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