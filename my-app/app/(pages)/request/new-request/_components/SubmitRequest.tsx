"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { useNewRequest } from "@/hooks/NewRequestContext";
import toast from "react-hot-toast";
import { debounce } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { format } from "date-fns";

export default function SubmitRequest() {
  const [requestStatus, setRequestStatus] = useState("request_now");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"));
  const { submittedEmployees, resetSubmittedEmployees } = useNewRequest();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const isDisabled = submittedEmployees.length === 0 || loading;

  const handleRequestSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const session = await getSession();
      if (!session) {
        throw new Error("Session token not found. Please log in again.");
      }

      let requestTime = new Date();
      if (requestStatus === "schedule_request") {
        if (!selectedDate || !time) {
          toast.error("Please select a valid date and time.");
          setLoading(false);
          return;
        }
        const [hours, minutes] = time.split(":").map(Number);
        requestTime = new Date(selectedDate);
        requestTime.setHours(hours);
        requestTime.setMinutes(minutes);

        if (requestTime < new Date()) {
          toast.error("Scheduled time cannot be in the past.");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/requests/submit-request", {
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
          request_time: requestTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.detail || "Failed to submit requests");
        throw new Error(result.detail || "Failed to submit requests");
      }

      toast.success(result.message || "Requests submitted successfully!");
      resetSubmittedEmployees();
      setNotes("");
    } catch (error) {
      console.log(error)
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandleRequestSubmission = debounce(handleRequestSubmission, 300);

  return (
    <div className="flex items-stretch gap-2 rounded-md h-full">
      <div className="flex flex-col space-y-2 w-1/3 h-full">
        <div className="p-2 rounded-md bg-white h-full">
          <RadioGroup
            defaultValue="request_now"
            onValueChange={(value) => setRequestStatus(value)}
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
                icon: <CalendarIcon className="w-4 h-4" />,
              },
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
        {requestStatus === "schedule_request" && (
          <div className="rounded-md bg-white p-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedDate
                    ? format(selectedDate, "PPP")
                    : "Pick a date"}{" "}
                  {time}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => setSelectedDate(date || null)}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
                <div className="mt-4">
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time
                  </label>
                  <Input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 block w-full"
                    min={
                      selectedDate &&
                      selectedDate.toDateString() ===
                        new Date().toDateString()
                        ? new Date().toISOString().slice(11, 16)
                        : undefined
                    }
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Notes Section */}
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
