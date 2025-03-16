"use client";
import React from "react";

interface MealScheduleTimelineProps {
  schedules?: Schedule[];
}

/**
 * MealScheduleTimeline renders a 24-hour horizontal timeline
 * with smaller height, minimal hour markers, and hour labels
 * placed above the timeline.
 */
const MealScheduleTimeline: React.FC<MealScheduleTimelineProps> = ({
  schedules,
}) => {
  // Create an array for hour markers from 0 to 24
  const hours = Array.from({ length: 25 }, (_, i) => i);

  return (
    // Removed "overflow-hidden" so the hour labels can appear above
    <div className="relative w-full bg-gray-200 rounded h-4">
      {/* Hour Markers */}
      {hours.map((hour) => {
        const leftPercent = (hour / 24) * 100;
        return (
          <div
            key={`hour-marker-${hour}`}
            className="absolute inset-y-0 border-l border-gray-300"
            style={{ left: `${leftPercent}%` }}
          >
            <span
              className="absolute text-[0.6rem] text-gray-600 whitespace-nowrap"
              style={{
                bottom: "100%",             // place label above the timeline
                left: "50%",
                transform: "translate(-50%, -2px)", // center horizontally & move up slightly
              }}
            >
              {hour}
            </span>
          </div>
        );
      })}

      {/* Scheduled Blocks (Green Bars) */}
      {schedules?.map((schedule, index) => {
        // Handle "HH:MM" or "HH:MM:SS"
        const [startHourStr, startMinStr] = schedule.schedule_from.split(":");
        const [endHourStr, endMinStr] = schedule.schedule_to.split(":");

        const startHour = parseInt(startHourStr, 10);
        const startMin = parseInt(startMinStr, 10);
        const endHour = parseInt(endHourStr, 10);
        const endMin = parseInt(endMinStr, 10);

        // Convert times to minutes since midnight
        const startTotal = startHour * 60 + startMin;
        const endTotal = endHour * 60 + endMin;

        // Calculate offsets/width as percentages of 24-hour day (1440 minutes)
        const left = (startTotal / 1440) * 100;
        const width = ((endTotal - startTotal) / 1440) * 100;

        return (
          <div
            key={index}
            className="absolute top-0 bottom-0 bg-green-500 rounded "
            style={{
              left: `${left}%`,
              width: `${width}%`,
            }}
          />
        );
      })}
    </div>
  );
};

export default MealScheduleTimeline;
