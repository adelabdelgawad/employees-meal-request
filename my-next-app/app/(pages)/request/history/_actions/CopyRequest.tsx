import React, { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import toast from "react-hot-toast";
import clientAxiosInstance from "@/lib/clientAxiosInstance";
import { KeyedMutator } from "swr";

interface CopyRequestProps {
  mutate: KeyedMutator<RequestsResponse>;
  record: RequestRecord;
}

const CopyRequest: React.FC<CopyRequestProps> = ({ mutate, record }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"));
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const onCopy = () => {
    console.log(`Copy request: ${record.id}`);
    setIsPopoverOpen(true);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
  };

  const handleSchedule = async () => {
    if (!selectedDate || !time) {
      toast.error("Please select a date and time.");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours);
    scheduledDate.setMinutes(minutes);

    if (scheduledDate < new Date()) {
      toast.error("Please select a future date and time.");
      return;
    }

    setLoading(true);

    try {
      // 1) Send the request to the server and wait for the response
      await clientAxiosInstance.post("/history/copy-request", {
        request_id: record.id,
        scheduled_time: scheduledDate.toISOString(),
      });
    
      // 2) Re-fetch all records so you get the complete, up-to-date list
      await mutate();
    
      setIsPopoverOpen(false);
      toast.success("Request updated successfully!");
    } catch (error) {
      toast.error("Failed to update the request. Please try again.");
      // Revalidate in case the data got partially changed
      mutate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={onCopy}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
          title="Copy"
        >
          <Copy size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={handleDateChange}
          fromDate={new Date()} // Disable past dates
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
            onChange={handleTimeChange}
            className="mt-1 block w-full"
          />
        </div>
        <Button onClick={handleSchedule} className="mt-4 w-full" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule"}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default CopyRequest;
