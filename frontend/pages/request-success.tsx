'use client';
import 'app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequestSuccess() {
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null); // Corrected state type
  const [countdown, setCountdown] = useState(30); // 30-second countdown

  // Handle request ID from query
  useEffect(() => {
    if (router.query.requestId) {
      const id = Array.isArray(router.query.requestId)
        ? router.query.requestId[0]
        : router.query.requestId;

      setRequestId(id);
    }
  }, [router.query]);

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/request/new-request');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Request Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Your requests have been submitted with the following IDs:
          </p>
          <ul className="text-lg font-bold text-green-600 mt-2">
            {requestId ? (
              <li key={requestId}>Request ID: {requestId}</li>
            ) : (
              <li>Loading request ID...</li>
            )}
          </ul>
          <p className="text-gray-500 mt-4">
            You will be redirected back to the homepage in {countdown} seconds.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => router.push('/request/new-request')}
          >
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
