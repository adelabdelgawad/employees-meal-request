"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRequest } from "@/context/RequestContext";
import { useAlerts } from "@/components/alert/useAlerts";

export default function SubmitRequestButton() {
  const { submittedEmployees } = useRequest();
  const { addAlert } = useAlerts();
  const [loading, setLoading] = useState(false);

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
    } catch (error: any) {
      addAlert(error.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRequestSubmission}
      disabled={submittedEmployees.length === 0 || loading}
      className={`w-full ${
        submittedEmployees.length === 0
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-green-700 text-white hover:bg-green-800"
      }`}
      style={{ height: "80px" }} // Increased button height
    >
      {loading ? "Submitting..." : "Submit Request"}
    </Button>
  );
}
