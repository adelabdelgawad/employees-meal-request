"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRequest } from "@/context/RequestContext";
import { useAlerts } from "@/components/alert/useAlerts";
import { useRouter } from "next/navigation";
import { debounce } from "@/lib/utils";

export default function SubmitRequestButton() {
  const { submittedEmployees } = useRequest();
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(false);

  // ✅ Call useRouter at the top level
  const router = useRouter();

  const handleRequestSubmission = async () => {
    if (submittedEmployees.length === 0) {
      addAlert("No requests to submit!", "warning");
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
      addAlert(result.message, "success");

      // ✅ Redirect to confirmation page with multiple IDs
      const requestIds = result.created_meal_request_ids.join(",");
      router.push(`/request-success?requestIds=${requestIds}`);
    } catch (error: any) {
      addAlert(error.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandleRequestSubmission = debounce(
    handleRequestSubmission,
    300
  );
  
  return (
    <Button
      onClick={debouncedHandleRequestSubmission}
      disabled={submittedEmployees.length === 0 || loading}
      className={`w-full ${
        submittedEmployees.length === 0 || loading
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-green-700 text-white hover:bg-green-800"
      }`}
    >
      {loading ? "Submitting..." : "Submit Request"}
    </Button>
  );
}
