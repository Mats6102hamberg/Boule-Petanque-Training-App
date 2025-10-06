import axios from 'axios';
import { API_URL } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getSessions = async (limit = 10, skip = 0) => {
  const response = await api.get('/training/sessions', {
    params: { limit, skip },
  });
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await api.post('/training/sessions', sessionData);
  return response.data;
};

export const analyzeThrow = async (throwData) => {
  const response = await api.post('/training/analyze', throwData);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/training/stats');
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/training/sessions/${sessionId}`);
  return response.data;
};
