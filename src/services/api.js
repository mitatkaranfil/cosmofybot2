import axios from 'axios';

// Get API URL from environment variables, fallback to default if not available
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true';

// Debug log to see what URL is being used
console.log('API URL:', API_URL);
console.log('Skip Auth:', SKIP_AUTH);

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

// Mock data for development and testing
const mockMiningStatus = {
  success: true,
  miningStatus: {
    isActive: false,
    miningLevel: 5,
    miningRate: 10,
    balance: 1000,
    pendingReward: 0,
    availableMiningSeconds: 3600,
    remainingDailySeconds: 7200,
    sessionDurationSeconds: 900,
    remainingSessionSeconds: 0,
    lastMiningTime: new Date().toISOString(),
    upgradeCost: 500
  }
};

// Authentication
export const authenticateUser = async (telegramData) => {
  // If SKIP_AUTH is true, return a mock successful auth
  if (SKIP_AUTH) {
    console.log('Bypassing authentication with mock data');
    return {
      success: true,
      user: {
        id: 12345,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'en',
        balance: 1000,
        level: 5,
        mining_rate: 10,
        is_mining: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      token: 'mock-jwt-token-for-development'
    };
  }

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
  if (SKIP_AUTH) {
    return {
      success: true,
      user: {
        id: 12345,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'en',
        balance: 1000,
        level: 5,
        mining_rate: 10,
        is_mining: false
      }
    };
  }

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
  if (SKIP_AUTH) {
    mockMiningStatus.miningStatus.isActive = true;
    mockMiningStatus.miningStatus.remainingSessionSeconds = mockMiningStatus.miningStatus.sessionDurationSeconds;
    mockMiningStatus.miningStatus.lastMiningTime = new Date().toISOString();
    return { success: true, message: 'Mining started successfully' };
  }

  try {
    const response = await apiClient.post('/mining/start');
    return response.data;
  } catch (error) {
    console.error('Error starting mining:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to start mining' };
  }
};

export const stopMining = async () => {
  if (SKIP_AUTH) {
    mockMiningStatus.miningStatus.isActive = false;
    mockMiningStatus.miningStatus.pendingReward += 100; // Mock reward
    return { success: true, message: 'Mining stopped successfully' };
  }

  try {
    const response = await apiClient.post('/mining/stop');
    return response.data;
  } catch (error) {
    console.error('Error stopping mining:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to stop mining' };
  }
};

export const getMiningStatus = async () => {
  if (SKIP_AUTH) {
    return mockMiningStatus;
  }

  try {
    const response = await apiClient.get('/mining/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching mining status:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch mining status' };
  }
};

export const collectReward = async () => {
  if (SKIP_AUTH) {
    mockMiningStatus.miningStatus.balance += mockMiningStatus.miningStatus.pendingReward;
    mockMiningStatus.miningStatus.pendingReward = 0;
    return { 
      success: true, 
      message: 'Reward collected successfully',
      reward: 100,
      newBalance: mockMiningStatus.miningStatus.balance
    };
  }

  try {
    const response = await apiClient.post('/mining/collect');
    return response.data;
  } catch (error) {
    console.error('Error collecting reward:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to collect reward' };
  }
};

export const upgradeLevel = async () => {
  if (SKIP_AUTH) {
    if (mockMiningStatus.miningStatus.balance >= mockMiningStatus.miningStatus.upgradeCost) {
      mockMiningStatus.miningStatus.balance -= mockMiningStatus.miningStatus.upgradeCost;
      mockMiningStatus.miningStatus.miningLevel += 1;
      mockMiningStatus.miningStatus.miningRate += 5;
      mockMiningStatus.miningStatus.upgradeCost *= 1.5;
      return { 
        success: true, 
        message: 'Mining level upgraded successfully',
        newLevel: mockMiningStatus.miningStatus.miningLevel,
        newMiningRate: mockMiningStatus.miningStatus.miningRate,
        newBalance: mockMiningStatus.miningStatus.balance
      };
    } else {
      return { success: false, message: 'Insufficient funds for upgrading' };
    }
  }

  try {
    const response = await apiClient.post('/mining/upgrade');
    return response.data;
  } catch (error) {
    console.error('Error upgrading level:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to upgrade level' };
  }
};

export const getMiningRewards = async () => {
  if (SKIP_AUTH) {
    return { 
      success: true, 
      rewards: [
        { date: new Date().toISOString(), amount: 100 },
        { date: new Date(Date.now() - 86400000).toISOString(), amount: 200 },
        { date: new Date(Date.now() - 172800000).toISOString(), amount: 150 }
      ]
    };
  }

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
  if (SKIP_AUTH) {
    mockMiningStatus.miningStatus.availableMiningSeconds += 900;
    return { success: true, message: 'Advertisement watched successfully' };
  }

  try {
    const response = await apiClient.post('/ads/watch');
    return response.data;
  } catch (error) {
    console.error('Error watching advertisement:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to process advertisement' };
  }
};

export const getEligibleAds = async () => {
  if (SKIP_AUTH) {
    return { 
      success: true, 
      ads: [
        { id: 1, type: 'video', reward: 15, duration: 30 },
        { id: 2, type: 'banner', reward: 10, duration: 15 }
      ]
    };
  }

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
  if (SKIP_AUTH) {
    return { 
      success: true, 
      leaderboard: Array(limit).fill(0).map((_, index) => ({
        id: 1000 + index,
        username: `user${index}`,
        first_name: `User ${index}`,
        score: 1000 - (index * 50),
        rank: index + 1
      }))
    };
  }

  try {
    const response = await apiClient.get(`/leaderboard?timeframe=${timeframe}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to get leaderboard' };
  }
};

export const getUserRank = async (timeframe = 'daily') => {
  if (SKIP_AUTH) {
    return { 
      success: true, 
      rank: {
        rank: 5,
        score: 750,
        total_users: 100
      }
    };
  }

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