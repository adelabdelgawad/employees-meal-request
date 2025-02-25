// lib/axiosInstance.ts
import axios from 'axios';
import { getSession } from './session'; // Adjust the import path as needed

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FASTAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session && session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
