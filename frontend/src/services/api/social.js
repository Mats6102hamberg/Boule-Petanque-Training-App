import axios from 'axios';
import { API_URL } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getFriends = async () => {
  const response = await api.get('/social/friends');
  return response.data;
};

export const addFriend = async (userId) => {
  const response = await api.post(`/social/friends/${userId}`);
  return response.data;
};

export const challengeFriend = async (challengeData) => {
  const response = await api.post('/social/challenge', challengeData);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/social/leaderboard');
  return response.data;
};
