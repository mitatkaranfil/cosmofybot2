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
  const [bypassDev, setBypassDev] = useState(false);
  
  console.log('Auth modes:', {
    isDevelopment,
    isHeroku,
    isTelegramWebApp,
    bypassDev,
    SKIP_AUTH
  });

  useEffect(() => {
    const authenticateWithServer = async () => {
      try {
        setIsLoading(true);
        // Rastgele kullanıcı ID'si oluştur - her kullanıcı farklı olsun
        const randomId = Math.floor(Math.random() * 1000000) + 1000000;
        
        // Telegram API verileri
        let telegramData = {
          initData: 'manual_telegram_data_' + randomId,
          user: {
            id: randomId,
            first_name: 'Telegram',
            last_name: 'User',
            username: 'telegram_user_' + randomId,
            language_code: 'tr'
          }
        };
        
        // Gerçek Telegram WebApp ortamındaysak, gerçek verileri almaya çalış
        if (isTelegramWebApp && window.Telegram?.WebApp) {
          try {
            const webApp = window.Telegram.WebApp;
            
            // WebApp'i genişlet
            if (!webApp.isExpanded) {
              webApp.expand();
            }
            
            console.log('Real Telegram WebApp detected, getting data');
            
            // Mevcut veriler ile yeni veri oluştur, Telegram kullanıcı verilerini ekle
            if (webApp.initDataUnsafe?.user) {
              console.log('Got real user data:', webApp.initDataUnsafe.user);
              telegramData = {
                initData: webApp.initData || 'telegram_web_app_' + randomId,
                user: webApp.initDataUnsafe.user || telegramData.user
              };
            } else {
              console.log('No real user data available, using fallback');
            }
          } catch (telegramError) {
            console.error('Error getting Telegram WebApp data:', telegramError);
          }
        }
        
        console.log('Authenticating with data:', telegramData);
        
        // Kimlik doğrulama
        const authResponse = await authenticateUser(telegramData);
        
        if (authResponse.success) {
          console.log('Authentication successful:', authResponse.user);
          setUser(authResponse.user);
          setError(null);
        } else {
          console.error('Authentication failed:', authResponse);
          
          // Yedek plan: Yerel kullanıcı verisi kullan
          if (isDevelopment || bypassDev) {
            setUser({
              id: randomId,
              telegramId: randomId.toString(),
              firstName: 'Telegram',
              lastName: 'User',
              username: 'telegram_user_' + randomId,
              walletBalance: 500,
              miningLevel: 1
            });
            setError(null);
          } else {
            setError('Authentication failed: ' + (authResponse.message || 'Unknown error'));
          }
        }
      } catch (error) {
        console.error('Authentication process error:', error);
        
        if (isDevelopment || bypassDev) {
          // Geliştirme modunda göstermelik kullanıcı
          setUser({
            id: Date.now(),
            telegramId: Date.now().toString(),
            firstName: 'Dev',
            lastName: 'User',
            username: 'dev_user',
            walletBalance: 1000,
            miningLevel: 5
          });
          setError(null);
        } else {
          setError('An error occurred during authentication: ' + error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    authenticateWithServer();
  }, [isDevelopment, bypassDev, isTelegramWebApp]);
  
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