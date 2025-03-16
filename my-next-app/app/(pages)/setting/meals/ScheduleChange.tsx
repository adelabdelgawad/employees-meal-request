"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import TimeSelector from "@/components/ui/time-selector";

export interface Schedule {
  meal_id: number;
  schedule_from: string; // Format "HH:MM"
  schedule_to: string; // Format "HH:MM"
  isDeleted?: boolean; // For soft-delete/undo
}

interface ScheduleChangeProps {
  initialSchedules?: Schedule[];
  onChange: (schedules: Schedule[]) => void;
  mealId: number;
}

const ScheduleChange: React.FC<ScheduleChangeProps> = ({
  initialSchedules = [],
  onChange,
  mealId,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const addSchedule = () => {
    // Check if both times are provided and fromTime is before toTime.
    if (fromTime && toTime && fromTime < toTime) {
      const newSchedule: Schedule = {
        meal_id: mealId,
        schedule_from: fromTime,
        schedule_to: toTime,
        isDeleted: false,
      };
      const newSchedules = [...schedules, newSchedule];
      console.log(newSchedules);
      setSchedules(newSchedules);
      setFromTime("");
      setToTime("");
      onChange(newSchedules);
    } else {
      alert(
        "Please enter valid times with the start time before the end time."
      );
    }
  };

  const toggleDelete = (index: number) => {
    const updated = schedules.map((s, i) =>
      i === index ? { ...s, isDeleted: !s.isDeleted } : s
    );
    setSchedules(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Time Selectors */}
      <div className="flex items-center space-x-4">
        <div className="p-2 flex-1">
          <TimeSelector
            time={fromTime}
            label="Start Time"
            onTimeChange={setFromTime}
          />
        </div>
        <div className="p-2 flex-1">
          <TimeSelector
            time={toTime}
            label="End Time"
            onTimeChange={setToTime}
          />
        </div>
      </div>

      {/* Add Schedule Button */}
      <div className="p-1 flex justify-center">
        <Button onClick={addSchedule} size="sm" className="w-1/2">
          Add
        </Button>
      </div>

      {/* Schedule List */}
      {schedules.length > 0 && (
        <ul className="list-disc pl-5 space-y-1">
          {schedules.map((s, index) => (
            <li
              key={index}
              className={`flex items-center justify-between ${
                s.isDeleted ? "line-through text-gray-500" : ""
              }`}
            >
              <span>
                {s.schedule_from} - {s.schedule_to}
              </span>
              <Button
                variant="ghost"
                onClick={() => toggleDelete(index)}
                className="ml-4"
              >
                {s.isDeleted ? (
                  <>
                    <RotateCcw size={14} className="mr-1" /> Undo
                  </>
                ) : (
                  <>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </>
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScheduleChange;
