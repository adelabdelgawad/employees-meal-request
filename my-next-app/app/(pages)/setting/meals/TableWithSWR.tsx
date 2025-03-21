"use client";

import React from "react";
import useSWR from "swr";
import { TableBody, Column } from "@/components/Table/table-body";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { getMeals } from "@/lib/actions/meal";
import MealScheduleTimeline from "./MealScheduleTimeline";
import EditMealSheet from "./EditMeal";


interface TableWithSWRProps {
  fallbackData: Meal[];
}

/**
 * TableWithSWR component fetches meals data using SWR and renders it in a table.
 */
export default function TableWithSWR({ fallbackData }: TableWithSWRProps) {
  // Fetch meal data using SWR.
  const { data, error, mutate } = useSWR("getMeals", getMeals, {
    fallbackData,
  });



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
        <div className="flex items-center space-x-2 w-full">
          {/* Render the timeline in a separate component */}
          <MealScheduleTimeline schedules={(meal.schedules ?? []).map(schedule => ({ ...schedule, meal_id: meal.id }))} />
        </div>
      ),
    }
  ];

  if (error) return <div>Error loading data...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <TableBody<Meal>
      columns={columns}
      data={Array.isArray(data) ? data : []}
      className="shadow-sm"
      // Pass mutate to the Actions component so buttons can update the cache
      options={(_, record: Meal) => (
        <EditMealSheet
        initialSchedules={(record.schedules ?? []).map(schedule => ({ ...schedule, meal_id: record.id }))}
        recordId={record.id}
        isActive={record.is_active}
        mutate={mutate}
      />
      )}
    />
  );
}
