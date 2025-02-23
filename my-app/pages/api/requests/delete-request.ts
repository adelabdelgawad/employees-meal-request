import type { NextApiRequest, NextApiResponse } from 'next';

const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let token = req.cookies.session; // Try to get from cookies
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]; // Try to get from headers
  }

  if (!token) {
    console.error("🚨 No authentication token found!");
    return res.status(401).json({
      status: "error",
      code: "NO_SESSION",
      message: "Authentication required",
    });
  }


  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  try {
    const apiResponse = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/requests/delete/${id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Ensure token is passed
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).json({ message: errorText });
    }

    return res.status(200).json({ message: 'Request deleted successfully.' });
  } catch (error) {
    console.error('Error deleting request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default handler;
