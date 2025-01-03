"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequest } from "@/context/RequestContext";

export default function SelectedEmployeesColumn() {
  const { submittedEmployees, setSubmittedEmployees } = useRequest();

  // Remove an employee from the submitted list
  const removeEmployee = (employeeId: number, mealTypeId: number) => {
    setSubmittedEmployees((prev) =>
      prev.filter(
        (entry) => !(entry.id === employeeId && entry.meal_id === mealTypeId)
      )
    );
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Submitted Employees
        </h2>
      </div>

      {/* Employee List */}
      {submittedEmployees.length > 0 ? (
        <ScrollArea className="overflow-y-auto border rounded-lg bg-gray-50 h-[calc(98vh-300px)]">
          <div className="space-y-2">
            {submittedEmployees.map((entry) => (
              <div
                key={`${entry.id}-${entry.meal_id}`}
                className="p-4 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center bg-white hover:shadow-md"
              >
                {/* Employee Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {entry.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Meal: {entry.meal_name}
                  </p>
                  <p className="text-sm text-gray-500">Notes: {entry.notes}</p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => removeEmployee(entry.id, entry.meal_id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center">
          No employees have been submitted yet.
        </div>
      )}
    </div>
  );
}
