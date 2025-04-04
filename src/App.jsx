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

// Telegram WebApp üzerinden initData alamıyorsak manuel olarak bir Telegram kullanıcısı gönderelim
const manualTelegramUser = {
  initData: 'manual_init_data_for_telegram',
  user: {
    id: Math.floor(Math.random() * 100000) + 1000000, // Rastgele kullanıcı ID'si
    first_name: 'Telegram',
    last_name: 'User',
    username: 'telegram_user',
    language_code: 'tr'
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Sadece geliştirme modunda aktif et, Heroku'da her zaman gerçek auth kullan
  // SKIP_AUTH değişkenini tamamen görmezden geliyoruz - prodüksiyonda gerçek kimlik doğrulama kullan
  const [bypassDev, setBypassDev] = useState(false);
  
  console.log('Auth modes:', {
    isDevelopment,
    isHeroku,
    isTelegramWebApp,
    bypassDev,
    SKIP_AUTH
  });

  // Manuel auth için fonksiyon
  const handleManualAuth = async () => {
    try {
      setIsLoading(true);
      // Manuel kullanıcı verisini kullan
      console.log('Using manual Telegram user data');
      const authResponse = await authenticateUser(manualTelegramUser);
      
      if (authResponse.success) {
        console.log('Manual Telegram authentication successful');
        setUser(authResponse.user);
        setError(null);
      } else {
        console.error('Manual Telegram authentication failed:', authResponse.message);
        setError('Telegram authentication failed. Try refreshing the page.');
      }
    } catch (error) {
      console.error('Manual Telegram authentication error:', error);
      setError('Error during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Telegram WebApp entegrasyonu için daha agresif bir yaklaşım
    if (isTelegramWebApp) {
      console.log('Telegram WebApp detected, using manual auth');
      handleManualAuth();
      return;
    } else if (isDevelopment || bypassDev) {
      console.log('Development mode or bypass mode, using mock data');
      // Geliştirme modunda mock kullanıcı verileri
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
      setIsLoading(false);
      return;
    } else {
      console.log('Production mode without Telegram WebApp, showing error');
      // Üretim modunda Telegram dışında hata göster
      setError('This app is designed to run inside Telegram. Please open it from Telegram.');
      setIsLoading(false);
      return;
    }
  }, [isTelegramWebApp, isDevelopment, bypassDev]);
  
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