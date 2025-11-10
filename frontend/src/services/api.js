// Centralized API Service Layer
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  googleLogin: async (credentialToken) => {
    const response = await apiClient.post('/auth/google/callback', {
      credential: credentialToken,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  verifyToken: async () => {
    const response = await apiClient.get('/auth/google/verify');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  getLibrary: async () => {
    const response = await apiClient.get('/library');
    return response.data;
  },

  getRecallTasks: async () => {
    const response = await apiClient.get('/recall-tasks');
    return response.data;
  },

  getAchievements: async () => {
    const response = await apiClient.get('/dashboard/achievements');
    return response.data;
  },

  generateContent: async (data) => {
    const response = await apiClient.post('/generate', data);
    return response.data;
  },

  generateCustomQuiz: async (data) => {
    const response = await apiClient.post('/generate-custom-quiz', data);
    return response.data;
  },
};

// ============================================
// INSIGHTS SERVICE
// ============================================
export const insightsService = {
  getInsights: async () => {
    const response = await apiClient.get('/insights');
    return response.data;
  },

  getRecommendations: async () => {
    const response = await apiClient.get('/recommendations');
    return response.data;
  },

  getClusters: async () => {
    const response = await apiClient.get('/clusters');
    return response.data;
  },

  getPerformance: async () => {
    const response = await apiClient.get('/insights/performance');
    return response.data;
  },
};

// ============================================
// KNOWLEDGE SERVICE
// ============================================
export const knowledgeService = {
  capture: async (data) => {
    const response = await apiClient.post('/capture', data);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/knowledge');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/knowledge/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/knowledge/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/knowledge/${id}`);
    return response.data;
  },

  setPriority: async (id, priority) => {
    const response = await apiClient.patch(`/knowledge/${id}/priority`, { priority });
    return response.data;
  },
};

// ============================================
// QUIZ SERVICE
// ============================================
export const quizService = {
  getQuiz: async (topicId) => {
    const response = await apiClient.get(`/quiz/${topicId}`);
    return response.data;
  },

  submitQuiz: async (quizId, answers) => {
    const response = await apiClient.post(`/quiz/${quizId}/submit`, { answers });
    return response.data;
  },

  getRecallQuiz: async (title) => {
    const response = await apiClient.get(`/recall-quiz/${encodeURIComponent(title)}`);
    return response.data;
  },

  submitRecallQuiz: async (answers) => {
    const response = await apiClient.post('/recall/submit', { answers });
    return response.data;
  },
};

// ============================================
// GRAPH SERVICE
// ============================================
export const graphService = {
  getNodes: async (params = {}) => {
    const response = await apiClient.get('/nodes', { params });
    return response.data;
  },

  getNodeByTitle: async (title, userId = 'demo_user') => {
    const response = await apiClient.get(`/node/${encodeURIComponent(title)}`, {
      params: { user_id: userId }
    });
    return response.data;
  },

  getConnections: async (nodeId) => {
    const response = await apiClient.get(`/nodes/${nodeId}/connections`);
    return response.data;
  },
};

// ============================================
// STATS SERVICE
// ============================================
export const statsService = {
  getStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  getRetentionStats: async () => {
    const response = await apiClient.get('/stats/retention');
    return response.data;
  },
};

// ============================================
// BILLING SERVICE (if needed in future)
// ============================================
export const billingService = {
  getPlans: async () => {
    const response = await apiClient.get('/billing/plans');
    return response.data;
  },

  subscribe: async (planId, paymentData) => {
    const response = await apiClient.post('/billing/subscribe', { planId, ...paymentData });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await apiClient.post('/billing/cancel');
    return response.data;
  },
};

// Export configured axios instance for custom requests
export default apiClient;
