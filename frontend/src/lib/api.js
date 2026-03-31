import axios from 'axios';
import { getIdToken } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 120000, // 2 min timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase auth token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not get auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred';

    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// ─── API Functions ─────────────────────────────────────────────

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const verifyScreenshot = async (imageBase64, mimeType, imageUri) => {
  return api.post('/api/verify', {
    image_base64: imageBase64,
    mime_type: mimeType,
    image_uri: imageUri,
  });
};

export const getHistory = async () => {
  return api.get('/api/history');
};

export const getTransaction = async (docId) => {
  return api.get(`/api/transaction/${docId}`);
};

export const getStats = async () => {
  return api.get('/api/stats');
};

export const generatePdfReport = async (documentId) => {
  const response = await api.post(
    '/api/report/pdf',
    { document_id: documentId },
    { responseType: 'blob' }
  );
  return response;
};

export default api;
