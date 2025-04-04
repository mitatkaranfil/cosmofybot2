import axios from 'axios';

// Get API URL from environment variables, fallback to default if not available
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Debug log to see what URL is being used
console.log('API URL:', API_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout to handle potential network delays
  timeout: 15000,
});

// Add a request interceptor to add the auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const authenticateUser = async (telegramData) => {
  try {
    const response = await apiClient.post('/auth/login', telegramData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: error.response?.data?.message || 'Authentication failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

// User Profile
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch profile' };
  }
};

// Mining Operations
export const startMining = async () => {
  try {
    const response = await apiClient.post('/mining/start');
    return response.data;
  } catch (error) {
    console.error('Error starting mining:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to start mining' };
  }
};

export const stopMining = async () => {
  try {
    const response = await apiClient.post('/mining/stop');
    return response.data;
  } catch (error) {
    console.error('Error stopping mining:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to stop mining' };
  }
};

export const getMiningStatus = async () => {
  try {
    const response = await apiClient.get('/mining/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching mining status:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch mining status' };
  }
};

export const collectReward = async () => {
  try {
    const response = await apiClient.post('/mining/collect');
    return response.data;
  } catch (error) {
    console.error('Error collecting reward:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to collect reward' };
  }
};

export const upgradeLevel = async () => {
  try {
    const response = await apiClient.post('/mining/upgrade');
    return response.data;
  } catch (error) {
    console.error('Error upgrading level:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to upgrade level' };
  }
};

export const getMiningRewards = async () => {
  try {
    const response = await apiClient.get('/mining/rewards');
    return response.data;
  } catch (error) {
    console.error('Error fetching mining rewards:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch mining rewards' };
  }
};

// Advertisement
export const watchAdvertisement = async () => {
  try {
    const response = await apiClient.post('/ads/watch');
    return response.data;
  } catch (error) {
    console.error('Error watching advertisement:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to process advertisement' };
  }
};

export const getEligibleAds = async () => {
  try {
    const response = await apiClient.get('/ads/eligible');
    return response.data;
  } catch (error) {
    console.error('Error fetching eligible ads:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch eligible ads' };
  }
};

// Leaderboard
export const getLeaderboard = async (timeframe = 'daily', limit = 20) => {
  try {
    const response = await apiClient.get(`/leaderboard?timeframe=${timeframe}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to get leaderboard' };
  }
};

export const getUserRank = async (timeframe = 'daily') => {
  try {
    const response = await apiClient.get(`/leaderboard/rank?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Get user rank error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to get user rank' };
  }
};

export default {
  authenticateUser,
  logout,
  getUserProfile,
  startMining,
  stopMining,
  getMiningStatus,
  collectReward,
  upgradeLevel,
  getMiningRewards,
  watchAdvertisement,
  getEligibleAds,
  getLeaderboard,
  getUserRank,
}; 