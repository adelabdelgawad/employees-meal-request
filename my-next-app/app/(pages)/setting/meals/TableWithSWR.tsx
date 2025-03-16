"use client";

import React from "react";
import useSWR from "swr";
import { TableBody, Column } from "@/components/Table/table-body";
import { CircleCheckIcon, CircleXIcon, Edit3 } from "lucide-react";
import MealSchdeuleSheet, { Schedule } from "./MealSchdeuleSheet";
import { getMeals, updateMealSchedules } from "@/app/actions/meal";


interface TableWithSWRProps {
  fallbackData: Meal[];
}

/**
 * TableWithSWR component fetches meals data using SWR and renders it in a table.
 * - The "ACTIVE" column displays an icon based on the meal's active status.
 * - The "SCHEDULES" column shows a 24-hour timeline with schedule intervals overlaid,
 *   and an "Edit Schedule" button with an edit icon. When clicked, it opens a shadcn Sheet
 *   (MealSchdeuleSheet) to edit the meal's schedules. On save, the sheet auto-closes.
 *
 * @param fallbackData - Initial meal data for SWR fallback.
 * @returns JSX.Element displaying the table.
 */
export default function TableWithSWR({ fallbackData }: TableWithSWRProps) {
  // Fetch meal data using SWR.
  const { data, error, mutate } = useSWR("getMeals", getMeals, {
    fallbackData,
  });
  
  /**
   * onUpdateSchedule is triggered when the user saves the updated schedules.
   * It calls the updateMealSchedules action and revalidates the data.
   *
   * @param id - Meal id.
   * @param schedules - Array of updated schedule intervals.
   * @param close - Callback to close the sheet.
   */
  const onUpdateSchedule = async (
    id: number,
    schedules: Schedule[],
    close: () => void
  ): Promise<void> => {
    try {
      await updateMealSchedules(id, schedules);
      mutate(); // Revalidate data after update.
      close(); // Close the sheet after successful update.
    } catch (error) {
      console.error(`Failed to update schedules for meal ${id}:`, error);
    }
  };

  // Define columns for the table.
  const columns: Column<Meal>[] = [
    { header: "ID", accessor: "id" },
    { header: "NAME", accessor: "name" },
    {
      header: "ACTIVE",
      accessor: "is_active",
      render: (meal: Meal) => (
        <div className="flex items-center justify-center">
          {meal.is_active ? (
            <CircleCheckIcon className="text-green-600" />
          ) : (
            <CircleXIcon className="opacity-25" />
          )}
        </div>
      ),
    },
    {
      header: "SCHEDULES",
      accessor: "schedules",
      render: (meal: Meal) => (
        <div className="flex items-center space-x-2">
          {/* Timeline container */}
          <div className="relative w-full h-6 bg-gray-200 rounded">
            {meal.schedules &&
              meal.schedules.map((schedule, index) => {
                // Convert HH:MM to total minutes since midnight.
                const [startHour, startMin] = schedule.schedule_from.split(":").map(Number);
                const [endHour, endMin] = schedule.schedule_to.split(":").map(Number);
                const startTotal = startHour * 60 + startMin;
                const endTotal = endHour * 60 + endMin;
                // Calculate left offset and width as percentages of a 24-hour timeline.
                const left = (startTotal / (24 * 60)) * 100;
                const width = ((endTotal - startTotal) / (24 * 60)) * 100;
                return (
                  <div
                    key={index}
                    className="absolute h-full bg-blue-500 rounded"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  ></div>
                );
              })}
          </div>
          {/* Edit Schedule button using the MealSchdeuleSheet component */}
          <MealSchdeuleSheet
            initialSchedules={meal.schedules || []}
            onSave={(schedules: Schedule[], close: () => void) =>
              onUpdateSchedule(meal.id, schedules, close)
            }
            onClose={() => {}}
          />
        </div>
      ),
    },
  ];

  if (error) return <div>Error loading data...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <TableBody<Meal>
      columns={columns}
      data={Array.isArray(data) ? data : []}
      className="shadow-sm"
    />
  );
}
