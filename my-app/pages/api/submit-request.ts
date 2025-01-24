import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { requests } = req.body;
    console.log('Received requests:', requests);

    // Validate that requests exist
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ message: 'No requests provided' });
    }

    // Transform the request keys to match your FastAPI backend requirements
    const transformedRequests = requests.map((request: any) => ({
      employee_id: request.id,
      employee_code: request.code,
      department_id: request.department_id,
      meal_id: request.meal_id,
    }));

    console.log('Transformed Requests:', transformedRequests);

    // Send transformed requests to the FastAPI backend
    const fastApiResponse = await fetch('http://localhost:8000/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedRequests),
    });

    if (!fastApiResponse.ok) {
      const errorData = await fastApiResponse.json();
      throw new Error(
        errorData.detail || 'Failed to process requests at FastAPI',
      );
    }

    // Parse FastAPI response
    const result = await fastApiResponse.json();
    console.log('FastAPI Response:', result);

    // ✅ Return the created meal request IDs directly from the result
    return res.status(200).json({
      message: 'Requests submitted successfully!',
      created_request_id: result.created_request_id,
    });
  } catch (error: any) {
    console.error('Error handling requests:', error);
    return res.status(500).json({
      message:
        error.message || 'An error occurred while processing the request',
    });
  }
}
