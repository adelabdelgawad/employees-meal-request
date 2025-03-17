// lib/services/request-history.ts
"use server"
import axiosInstance from '@/lib/axiosInstance';
import { cookies } from 'next/headers';

export async function getNewRequestData(): Promise<NewRequestDataResponse> {
  try {
    // Extract the session cookie from the cookie store
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    // Set the Authorization header if the session cookie exists
    if (sessionCookie) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${sessionCookie}`;
    } else {
      // Remove the Authorization header if no session cookie is present
      delete axiosInstance.defaults.headers.common['Authorization'];
    }

    // Pass the params object to axiosInstance.
    const response = await axiosInstance.get('/new-request-data');
    const data =  response.data;
    return data
  } catch (error: unknown) {
    console.error('Error fetching requests:', error);
    throw new Error('Failed to fetch requests');
  }
}
