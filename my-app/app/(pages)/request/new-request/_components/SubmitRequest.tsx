"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Clock, Calendar, Bookmark } from "lucide-react";
import { useNewRequest } from "@/hooks/NewRequestContext";
import toast from "react-hot-toast";
import { debounce } from "@/lib/utils";
import { getSession } from "@/lib/session";

/**
 * RequestForm component that handles submission of requests.
 * It includes timing options, notes input, and a submit button.
 *
 * This component uses a debounced submit handler to avoid multiple rapid submissions.
 */
export default function RequestForm() {
  const [requestStatus, setRequestStatus] = useState("request_now");
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const { submittedEmployees, resetSubmittedEmployees } = useNewRequest();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const isDisabled = submittedEmployees.length === 0 || loading;

  /**
   * Handles request submission with enhanced error checking for JSON responses.
   * @param event - The form submission event.
   */
  const handleRequestSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const session = await getSession();
      if (!session) {
        throw new Error("Session token not found. Please log in again.");
      }

      const response = await fetch("/api/submit-request", {
        // Adjusted endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session}`,
        },
        credentials: "include",
        body: JSON.stringify({
          requests: submittedEmployees,
          notes,
          request_timing_option: requestStatus,
          request_time: scheduleDate,
        }),
      });

      let result;
      const contentType = response.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const textResult = await response.text();
        throw new Error(textResult || "Unexpected response format");
      }

      if (!response.ok) {
        toast.error(result.detail || "Failed to submit requests");
        throw new Error(result.detail || "Failed to submit requests");
      }

      toast.success(result.message || "Requests submitted successfully!");
      resetSubmittedEmployees();
      setNotes(""); // Clear notes after successful submission
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Use debounce to limit the rate of submissions
  const debouncedHandleRequestSubmission = debounce(
    handleRequestSubmission,
    300
  );

  return (
    <div className="flex items-stretch gap-2 rounded-md h-full">
      {/* Left Section: Timing Options and DateTimePicker */}
      <div className="flex flex-col space-y-2 w-1/3 h-full">
        <div className="p-2 rounded-md bg-white h-full">
          <RadioGroup
            defaultValue="request_now"
            onValueChange={setRequestStatus}
            className="flex flex-row gap-4"
          >
            {[
              {
                value: "request_now",
                label: "Request Now",
                icon: <Clock className="w-4 h-4" />,
              },
              {
                value: "schedule_request",
                label: "Schedule",
                icon: <Calendar className="w-4 h-4" />,
              },
              // {
              //   value: "save_for_later",
              //   label: "Save for Later",
              //   icon: <Bookmark className="w-4 h-4" />,
              // },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex items-center space-x-2"
                >
                  {option.icon}
                  <span>{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="rounded-md bg-white">
          <DateTimePicker
            selectedDateTime={scheduleDate}
            onChange={setScheduleDate}
            disabled={requestStatus !== "schedule_request"}
          />
        </div>
      </div>

      {/* Middle Section: Notes Input */}
      <div className="w-1/3 h-full">
        <Textarea
          placeholder="Add your request notes here [optional]..."
          className="w-full h-full resize-none border rounded-md p-2 bg-white"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Right Section: Submit Button */}
      <div className="flex-1 h-full flex items-center justify-center">
        <Button
          type="submit"
          className="w-full h-full text-lg bg-blue-600 text-white rounded-md"
          onClick={debouncedHandleRequestSubmission}
          disabled={isDisabled}
          variant={isDisabled ? "secondary" : "default"}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}
