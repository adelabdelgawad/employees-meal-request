// lib/services/request-history.ts
"use server"
import { cookies } from 'next/headers';
import axiosInstance from '../axiosInstance';

/**
 * Fetches the history of requests.
 *
 * @param {number} [page=1] - The page number to retrieve.
 * @returns {Promise<RequestsResponse>} - A promise resolving to the requests response.
 * @throws {Error} - If the request fails.
 */
export async function getHistoryRequests(page: number = 1): Promise<RequestsResponse> {
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
    const response = await axiosInstance.get('/requests/history', {
      params: { page: page.toString() },
    });

    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching requests:', error);
    throw new Error('Failed to fetch requests');
  }
}
