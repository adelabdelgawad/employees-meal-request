// lib/axiosInstance.ts
import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Creates an Axios instance configured to include the session cookie
 * as a Bearer token in the Authorization header for all requests.
 *
 * @returns {axios.AxiosInstance} Configured Axios instance.
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FASTAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Add a request interceptor to include the session token from cookies
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session')?.value;
      if (sessionCookie) {
        config.headers.Authorization = `Bearer ${sessionCookie}`;
      }
    } catch (error) {
      console.error('Error retrieving cookies:', error);
      // Optionally handle the error, e.g., redirect to login
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
