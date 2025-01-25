"use client";

import { useState } from "react";
import { useNewRequest } from "@/hooks/NewRequestContext";
import { toast } from "react-hot-toast";
import { debounce } from "@/lib/utils";
import { toastWarning } from "@/lib/utils/toast";
export default function SubmitRequestButton() {
  const { submittedEmployees, resetSubmittedEmployees } = useNewRequest(); // ✅ Added reset function
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        body: JSON.stringify({ requests: submittedEmployees }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit requests");
      }

      const result = await response.json();
      toast.success(result.message);

      // ✅ Reset the form after successful submission
      resetSubmittedEmployees();
      setSubmitted(false); // Reset the button state
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounced submission handler
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
