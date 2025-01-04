"use client";
import "app//globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestSuccess() {
  const router = useRouter();
  const { requestIds } = router.query; // Get the request IDs from query params
  const [countdown, setCountdown] = useState(30); // 30-second countdown

  // Convert requestIds to an array
  const mealRequestIds = typeof requestIds === "string" ? requestIds.split(",") : [];

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      router.push("/request/new-request"); // Redirect to home page after countdown
    }

    return () => clearInterval(timer); // Cleanup timer
  }, [countdown, router]);

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
            {mealRequestIds.map((id: string) => (
              <li key={id}>Request ID: {id}</li>
            ))}
          </ul>
          <p className="text-gray-500 mt-4">
            You will be redirected back to the homepage in {countdown} seconds.
          </p>
          <Button className="mt-4 w-full" onClick={() => router.push("/request/new-request")}>
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
