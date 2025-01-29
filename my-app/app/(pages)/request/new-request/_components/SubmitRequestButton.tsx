"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "@/lib/utils"; // Adjust import to your actual utils
import { useNewRequest } from "@/hooks/NewRequestContext";
import { toastWarning } from "@/lib/utils/toast";

export default function SubmitRequestButton() {
  const { submittedEmployees, resetSubmittedEmployees } = useNewRequest();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handles the actual request
  const handleRequestSubmission = async () => {
    if (submittedEmployees.length === 0) {
      toastWarning("No requests to submit!");
      return;
    }

    setLoading(true);
    try {
      // Use fetch with credentials so cookies (session token) are sent
      const response = await fetch("/api/submit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // <--- Ensures the session cookie is included
        body: JSON.stringify({ requests: submittedEmployees }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit requests");
      }

      const result = await response.json();
      toast.success(result.message || "Requests submitted successfully!");

      // Reset state after successful submission
      resetSubmittedEmployees();
      setSubmitted(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Debounce the submission to avoid rapid clicks
  const debouncedHandleRequestSubmission = debounce(
    handleRequestSubmission,
    300
  );

  return (
    <button
      onClick={debouncedHandleRequestSubmission}
      disabled={submitted || submittedEmployees.length === 0 || loading}
      className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
        submitted || submittedEmployees.length === 0 || loading
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-green-700 text-white hover:bg-green-800"
      }`}
    >
      {loading ? "Submitting..." : "Submit Request"}
    </button>
  );
}
