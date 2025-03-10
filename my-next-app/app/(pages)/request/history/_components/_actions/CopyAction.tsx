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
import { HistoryRequest } from "../HistoryDataTable";

interface CopyActionProps {
  requestId: number;
  setData: React.Dispatch<React.SetStateAction<HistoryRequest[]>>; // 🛑 Receive setData
}

const CopyAction: React.FC<CopyActionProps> = ({ requestId, setData }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"));
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const onCopy = () => {
    console.log(`Copy request: ${requestId}`);
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
  
    try {
      const response = await clientAxiosInstance.post("/history/copy-request", {
        request_id: requestId,
        scheduled_time: scheduledDate.toISOString(),
      });
  
      if (response.status === 200) {
        toast.success("Request scheduled successfully.");
        setIsPopoverOpen(false);
  
        // 🛑 Update UI by adding new copied request
        setData(prevData => [...prevData, response.data]);
      } else {
        toast.error("Failed to schedule the request.");
      }
    } catch (error) {
      console.error("Error scheduling request:", error);
      toast.error("An error occurred while scheduling the request.");
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
        <Button onClick={handleSchedule} className="mt-4 w-full">
          Schedule
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default CopyAction;
