"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "@/lib/utils"; // Adjust import to your actual utils
import { useNewRequest } from "@/hooks/NewRequestContext";
import { toastWarning } from "@/lib/utils/toast";
import { Button } from "@/components/ui/button";

export default function SubmitRequestButton() {
  const { submittedEmployees, resetSubmittedEmployees } = useNewRequest();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handles the actual request submission
  const handleRequestSubmission = async () => {
    if (submittedEmployees.length === 0) {
      toastWarning("No requests to submit!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/submit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures the session cookie is included
        body: JSON.stringify({ requests: submittedEmployees }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit requests");
      }

      const result = await response.json();
      toast.success(result.message || "Requests submitted successfully!");

      // Reset state after successful submission
      resetSubmittedEmployees();
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Debounce submission to prevent multiple clicks
  const debouncedHandleRequestSubmission = debounce(
    handleRequestSubmission,
    300
  );

  // Determine if button should be disabled
  const isDisabled = submitted || submittedEmployees.length === 0 || loading;

  return (
    <Button
      onClick={debouncedHandleRequestSubmission}
      disabled={isDisabled}
      className="w-full h-full flex items-center justify-center text-lg font-medium"
      variant={isDisabled ? "secondary" : "default"}
      style={{ minHeight: "100%" }} // Ensures full height inside the parent
    >
      {loading ? "Submitting..." : "Submit Request"}
    </Button>
  );
}
