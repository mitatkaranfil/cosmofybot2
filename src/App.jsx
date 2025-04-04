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
            // Expand the webapp regardless of authentication status
            if (!webApp.isExpanded) {
              console.log('Expanding WebApp');
              webApp.expand();
            }
            
            // Log Telegram environment details for debugging
            console.log('Telegram WebApp details:', { 
              version: webApp.version,
              platform: webApp.platform,
              colorScheme: webApp.colorScheme,
              themeParams: webApp.themeParams,
              isExpanded: webApp.isExpanded,
              viewportHeight: webApp.viewportHeight,
              viewportStableHeight: webApp.viewportStableHeight,
            });
            
            // Get Telegram WebApp data
            const initData = webApp.initData;
            console.log('Telegram initData length:', initData?.length || 0);
            console.log('Telegram initData first 100 chars:', initData?.substring(0, 100) || 'empty');
            
            // Check if user data is available
            if (webApp.initDataUnsafe) {
              console.log('Telegram initDataUnsafe available:', !!webApp.initDataUnsafe);
              console.log('Telegram user available:', !!webApp.initDataUnsafe.user);
              
              if (webApp.initDataUnsafe.user) {
                console.log('Telegram user ID:', webApp.initDataUnsafe.user.id);
              }
            } else {
              console.warn('Telegram initDataUnsafe is not available');
            }
            
            // Proceed with authentication if we have user data
            let userData = null;
            
            // In production, require proper initData and user data
            // In development or with bypass, be more permissive
            if (initData && webApp.initDataUnsafe?.user) {
              userData = {
                initData,
                user: webApp.initDataUnsafe.user
              };
              
              console.log('Using real Telegram user data for authentication');
            } else if (bypassDev) {
              // Create mock data for development/testing
              userData = {
                initData: 'mock_init_data_for_testing',
                user: {
                  id: 12345678,
                  first_name: 'Dev',
                  last_name: 'User',
                  username: 'devuser',
                  language_code: 'en'
                }
              };
              
              console.log('Using mock data for authentication in dev/bypass mode');
            } else {
              console.error('Telegram WebApp initData is invalid and bypass is not enabled');
              setError('Invalid Telegram data. Please try opening the app again from Telegram.');
              setIsLoading(false);
              return;
            }
            
            try {
              // Authenticate with the backend
              console.log('Sending authentication request to backend');
              const authResponse = await authenticateUser(userData);
              
              if (authResponse.success) {
                console.log('Authentication successful');
                setUser(authResponse.user);
                setError(null);
                
                // Notify Telegram that the app is ready
                webApp.ready();
              } else {
                console.error('Backend authentication failed:', authResponse.message);
                
                if (bypassDev) {
                  console.log('Falling back to dev mode due to auth failure');
                  throw new Error('Backend authentication failed, falling back to dev mode');
                } else {
                  setError(authResponse.message || 'Authentication failed');
                }
              }
            } catch (authError) {
              console.error('Authentication request error:', authError);
              
              if (bypassDev) {
                console.log('Falling back to dev mode due to auth request error');
                throw new Error('Authentication request failed, falling back to dev mode');
              } else {
                setError('Error communicating with authentication server. Please try again.');
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