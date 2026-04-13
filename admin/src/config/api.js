import axios from 'axios';
import { auth } from '../config/firebase';

const API = axios.create({
  baseURL: 'https://blog-pro-full-system-backend.onrender.com/api',
});

// Add auth token to every request
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
