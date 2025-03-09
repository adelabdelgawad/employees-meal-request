// lib/clientAxiosInstance.ts
import axios from "axios";

const clientAxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FASTAPI_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default clientAxiosInstance;