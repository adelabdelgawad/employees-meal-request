// pages/api/requests.ts
import axiosInstance from '@/lib/axiosInstance';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract the session cookie from the API request
    const sessionCookie = req.cookies.session;
    // Pass the session cookie as a Bearer token if available
    const response = await axiosInstance.get('/requests', {
      params: req.query,
      headers: {
        Authorization: sessionCookie ? `Bearer ${sessionCookie}` : '',
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ detail: 'Failed to fetch requests' });
  }
}