import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"; // Adjust this import based on your project structure
import { Edit3 } from "lucide-react";

export interface Schedule {
  schedule_from: string; // Format "HH:MM"
  schedule_to: string; // Format "HH:MM"
}

interface MealSchdeuleSheetProps {
  initialSchedules?: Schedule[];
  onSave: (schedules: Schedule[], close: () => void) => void;
    onClose: () => void;
}

/**
 * A shadcn Sheet component that allows users to edit a meal's schedule.
 * The sheet appears from the side (or bottom) and contains a form for adding time intervals.
 */
const MealSchdeuleSheet: React.FC<MealSchdeuleSheetProps> = ({
  initialSchedules = [],
  onSave,
  onClose,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const addSchedule = () => {
    // Validate that both times are provided and that fromTime is less than toTime.
    if (fromTime && toTime && fromTime < toTime) {
      setSchedules([
        ...schedules,
        { schedule_from: fromTime, schedule_to: toTime },
      ]);
      setFromTime("");
      setToTime("");
    } else {
      alert(
        "Please enter valid times with the start time before the end time."
      );
    }
  };

  const handleSave = () => {
    onSave(schedules);
    onClose();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1 text-sm text-blue-600"
          onClick={handleSave}
        >
          <Edit3 size={16} /> Edit Schedules
        </button>
      </SheetTrigger>
      <SheetContent className="max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Schedule</SheetTitle>
          <SheetDescription>
            Edit the time intervals for this meal.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <label htmlFor="fromTime" className="mb-1">
                From:
              </label>
              <input
                id="fromTime"
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="border rounded p-1"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="toTime" className="mb-1">
                To:
              </label>
              <input
                id="toTime"
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="border rounded p-1"
              />
            </div>
            <button
              type="button"
              onClick={addSchedule}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>

          {schedules.length > 0 && (
            <ul className="list-disc pl-5">
              {schedules.map((s, index) => (
                <li key={index}>
                  {s.schedule_from} - {s.schedule_to}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end space-x-2">
            <SheetClose asChild>
              <button type="button" className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
            </SheetClose>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MealSchdeuleSheet;
