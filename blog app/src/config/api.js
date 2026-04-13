import axios from 'axios';
import { auth } from './firebase';

const API = axios.create({
  // Use 10.0.2.2 to connect to local server from Android Emulator
  // For physical device, replace with your machine's IP address
  baseURL: 'http://192.168.164.227:5000/api', 
});

API.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
