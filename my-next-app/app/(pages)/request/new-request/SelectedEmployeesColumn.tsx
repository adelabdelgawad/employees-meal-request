"use client";

import { useNewRequest } from "@/hooks/NewRequestContext";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Accordion from "@radix-ui/react-accordion";
import { Rubik } from "next/font/google";

// Apply Rubik font
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface Entry {
  id: number;
  name: string;
  meal_id: number;
  meal_name: string;
  notes: string;
}

export default function SelectedEmployeesColumn() {
  const { submittedEmployees, setSubmittedEmployees } = useNewRequest();

  // Group employees by meal type
  const employeesByMeal: Record<string, Entry[]> = submittedEmployees.reduce(
    (acc, entry) => {
      acc[entry.meal_name] = acc[entry.meal_name] || [];
      acc[entry.meal_name].push(entry);
      return acc;
    },
    {} as Record<string, Entry[]>
  );

  // Remove an employee from the submitted list
  const removeEmployee = (employeeId: number, MealId: number) => {
    setSubmittedEmployees((prev) =>
      prev.filter(
        (entry) => !(entry.id === employeeId && entry.meal_id === MealId)
      )
    );
  };

  return (
    <div className="flex flex-col h-full ">
      {/* Employee List */}
      {Object.keys(employeesByMeal).length > 0 ? (
        <ScrollArea.Root className="flex-1 overflow-auto ">
          <ScrollArea.Viewport className="pb-5">
            <Accordion.Root
              type="multiple"
              defaultValue={Object.keys(employeesByMeal)}
            >
              {Object.entries(employeesByMeal).map(([mealName, employees]) => (
                <Accordion.Item key={mealName} value={mealName}>
                  <Accordion.Header>
                    <Accordion.Trigger className="text-lg font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 p-3 mt-2  w-full text-left">
                      {mealName}
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className=" bg-white border rounded-lg ">
                    <div className="space-y-1">
                      {employees.map((entry) => (
                        <div
                          key={`${entry.id}-${entry.meal_id}`}
                          className="p-2 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center bg-white hover:shadow-md"
                        >
                          <div>
                            <h4
                              className={`text-sm font-semibold text-gray-800 ${rubik.className}`}
                            >
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
                          <button
                            onClick={() =>
                              removeEmployee(entry.id, entry.meal_id)
                            }
                            className="text-red-600 border border-red-600 rounded-md px-3 py-1 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="bg-gray-200">
            <ScrollArea.Thumb className="bg-gray-400 rounded" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      ) : (
        <div className="p-4 text-center text-gray-500 flex-1 flex items-center justify-center">
          No employees have been submitted yet.
        </div>
      )}
    </div>
  );
}
