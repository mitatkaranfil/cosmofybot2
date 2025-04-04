import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authenticateUser } from './services/api';
import Navbar from './components/layout/Navbar';
import Mining from './views/Mining';
import Profile from './views/Profile';
import Leaderboard from './views/Leaderboard';
import Loader from './components/ui/Loader';

// Conditional WebApp import - don't try to import if not in a browser environment
let WebAppSDK = null;
if (typeof window !== 'undefined') {
  try {
    // Only try to import if we're in a browser
    WebAppSDK = require('@twa-dev/sdk').WebApp;
  } catch (error) {
    console.warn('Could not import WebApp SDK:', error);
  }
}

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bypassDev, setBypassDev] = useState(false);
  
  useEffect(() => {
    const handleTelegramAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if we're in Telegram WebApp using window.Telegram
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          try {
            // Use window.Telegram.WebApp API directly 
            // instead of the imported WebApp from @twa-dev/sdk
            webApp.ready();
            webApp.expand();
          } catch (webAppError) {
            console.warn('Error initializing Telegram WebApp:', webAppError);
            // Continue execution even if WebApp methods fail
          }
          
          // Get user data from Telegram WebApp
          const initData = webApp.initData || '';
          const userData = {
            initData,
            user: webApp.initDataUnsafe?.user || {}
          };
          
          // Authenticate with the backend
          const authResponse = await authenticateUser(userData);
          
          if (authResponse.success) {
            setUser(authResponse.user);
            setError(null);
          } else {
            setError(authResponse.message || 'Authentication failed');
          }
        } else {
          // If not in Telegram WebApp, use local development mode
          console.warn('Telegram WebApp not detected. Using development mode.');
          
          if (isDevelopment || bypassDev) {
            // Skip backend authentication in development/testing mode
            console.log('Development mode: Using mock user data');
            
            // Set mock user directly without backend authentication
            setUser({
              id: 12345,
              first_name: 'Dev',
              last_name: 'User',
              username: 'devuser',
              language_code: 'en',
              balance: 1000,
              level: 5,
              mining_rate: 10,
              is_mining: false
            });
            setError(null);
          } else {
            // For production environment, try to authenticate but show bypass option if it fails
            const mockUser = {
              id: 12345,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'en'
            };
            
            try {
              const authResponse = await authenticateUser({ 
                initData: 'development', 
                user: mockUser 
              });
              
              if (authResponse.success) {
                setUser(authResponse.user);
                setError(null);
              } else {
                setError('This app is designed to run inside Telegram. Please open it from Telegram.');
              }
            } catch (err) {
              console.error('Auth error:', err);
              setError('This app is designed to run inside Telegram. Please open it from Telegram.');
            }
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    handleTelegramAuth();
  }, [bypassDev]);
  
  if (isLoading) {
    return <Loader message="Initializing application..." fullScreen />;
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark p-4">
        <div className="bg-card-bg rounded-xl p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          
          <div className="flex flex-col space-y-3">
            <button 
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            
            {!isDevelopment && !window.Telegram?.WebApp && (
              <button
                className="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium mt-2"
                onClick={() => setBypassDev(true)}
              >
                Use Demo Mode
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-white">
        <Navbar user={user} />
        
        <main className="flex-grow pb-16">
          <Routes>
            <Route path="/" element={<Mining />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 