// lib/services/request-history.ts

import axiosInstance from "../axiosInstance";

export async function getHistoryRequests() {
  try {
    const response = await axiosInstance.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error in getHistoryRequests:', error);
    throw error;
  }
}
