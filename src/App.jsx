import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authenticateUser } from './services/api';
import Navbar from './components/layout/Navbar';
import Mining from './views/Mining';
import Profile from './views/Profile';
import Leaderboard from './views/Leaderboard';
import Loader from './components/ui/Loader';

// Environment variables for configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true';

// Check if we're in development mode or running on Heroku
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isHeroku = window.location.hostname.includes('herokuapp.com');
const isTelegramWebApp = Boolean(window.Telegram?.WebApp);

// Debug info
console.log('Environment config:', {
  API_URL,
  SKIP_AUTH,
  isDevelopment,
  isHeroku,
  isTelegramWebApp
});

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Sadece geliştirme modunda aktif et, Heroku'da her zaman gerçek auth kullan
  const [bypassDev, setBypassDev] = useState(SKIP_AUTH || (isDevelopment && !isTelegramWebApp));
  
  useEffect(() => {
    const handleTelegramAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if we're in Telegram WebApp
        if (isTelegramWebApp) {
          const webApp = window.Telegram.WebApp;
          
          try {
            // Get Telegram WebApp data
            const initData = webApp.initData;
            
            // Make sure the WebApp is ready
            if (!webApp.isExpanded) {
              webApp.expand();
            }
            
            // Check if we have valid init data
            if (initData && webApp.initDataUnsafe?.user) {
              const userData = {
                initData,
                user: webApp.initDataUnsafe.user
              };
              
              console.log('Telegram user data:', userData);
              
              // Authenticate with the backend
              const authResponse = await authenticateUser(userData);
              
              if (authResponse.success) {
                setUser(authResponse.user);
                setError(null);
                
                // Notify Telegram that the app is ready
                webApp.ready();
              } else {
                setError(authResponse.message || 'Authentication failed');
                console.error('Backend authentication failed:', authResponse.message);
                
                if (bypassDev) {
                  throw new Error('Backend authentication failed, falling back to dev mode');
                }
              }
            } else {
              console.warn('Telegram WebApp initData is empty or invalid');
              if (bypassDev) {
                throw new Error('Telegram authentication failed, falling back to dev mode');
              } else {
                setError('Invalid Telegram data. Please try opening the app again from Telegram.');
              }
            }
          } catch (webAppError) {
            console.warn('Error getting Telegram user data:', webAppError);
            if (bypassDev) {
              throw new Error('Telegram authentication failed, falling back to dev mode');
            } else {
              setError('Error processing Telegram data. Please try again.');
            }
          }
        } else if (isDevelopment || bypassDev) {
          // If not in Telegram WebApp but in development mode, use mock data
          console.warn('Telegram WebApp not detected. Using development mode.');
          
          // Set mock user directly without backend authentication in dev mode
          setUser({
            id: 12345,
            telegramId: "12345678",
            firstName: 'Dev',
            lastName: 'User',
            username: 'devuser',
            languageCode: 'en',
            walletBalance: 1000,
            miningLevel: 5,
            miningRate: 10,
            isActive: false
          });
          setError(null);
        } else {
          // For production environment outside Telegram
          setError('This app is designed to run inside Telegram. Please open it from Telegram.');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        // If there's an error and we have bypass enabled, use mock data
        if (bypassDev) {
          console.log('Error occurred but bypass is enabled. Using mock data.');
          setUser({
            id: 12345,
            telegramId: "12345678",
            firstName: 'Dev',
            lastName: 'User',
            username: 'devuser',
            languageCode: 'en',
            walletBalance: 1000,
            miningLevel: 5,
            miningRate: 10,
            isActive: false
          });
          setError(null);
        } else {
          setError('Failed to authenticate. Please try again.');
        }
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
            
            {!isDevelopment && !isTelegramWebApp && (
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