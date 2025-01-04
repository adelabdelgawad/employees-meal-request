"use client";

interface Entry {
  id: number;
  name: string;
  meal_id: number;
  meal_name: string;
  notes: string;
}

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useRequest } from "@/context/RequestContext";

export default function SelectedEmployeesColumn() {
  const { submittedEmployees, setSubmittedEmployees } = useRequest();

  // Group employees by meal type
  const employeesByMealType: Record<string, Entry[]> =
    submittedEmployees.reduce((acc, entry) => {
      acc[entry.meal_name] = acc[entry.meal_name] || [];
      acc[entry.meal_name].push(entry);
      return acc;
    }, {} as Record<string, Entry[]>);

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
      {Object.keys(employeesByMealType).length > 0 ? (
        <ScrollArea className="flex-1 overflow-auto border rounded-lg bg-gray-50">
          {Object.keys(employeesByMealType).length > 0 ? (
            <Accordion
              type="multiple"
              defaultValue={Object.keys(employeesByMealType)}
            >
              {Object.entries(employeesByMealType).map(
                ([mealName, employees]) => (
                  <AccordionItem key={mealName} value={mealName}>
                    <AccordionTrigger className="text-lg font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 p-3 rounded-md">
                      {mealName}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        {employees.map((entry) => (
                          <div
                            key={`${entry.id}-${entry.meal_id}`}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center bg-white hover:shadow-md"
                          >
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800">
                                {entry.name}
                              </h4>
                              <div className="flex space-x-2">
                                <p className="text-sm text-gray-500">
                                  Meal: {entry.meal_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Notes: {entry.notes}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() =>
                                removeEmployee(entry.id, entry.meal_id)
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          ) : (
            <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center">
              No employees have been submitted yet.
            </div>
          )}
        </ScrollArea>
      ) : (
        <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center">
          No employees have been submitted yet.
        </div>
      )}
    </div>
  );
}
