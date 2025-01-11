"use client";

import { useEffect, useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useRequest } from "@/hooks/RequestContext";
import EmployeeSelectionDialog from "../_components/EmployeeSelectionDialog";
import FilterComponent from "../_components/Filter";
import SelectionActions from "../_components/SelectionActions";
import { Rubik } from "next/font/google";

// Apply Rubik font
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function EmployeeColumn() {
  const {
    employees,
    selectedEmployees,
    setSelectedEmployees,
    mealTypes,
    selectedDepartments,
    submittedEmployees,
  } = useRequest();

  // Filter employees based on selected departments and meal types
  const [filteredEmployees, setFilteredEmployees] = useState(() =>
    employees.filter(
      (emp) =>
        !mealTypes.every((mealType) =>
          submittedEmployees.some(
            (submitted) =>
              submitted.id === emp.id && submitted.meal_id === mealType.id
          )
        )
    )
  );

  // Re-filter employees when dependencies change
  useEffect(() => {
    const filterEmployees = employees.filter((emp) =>
      selectedDepartments.length === 0
        ? !mealTypes.every((mealType) =>
            submittedEmployees.some(
              (submitted) =>
                submitted.id === emp.id && submitted.meal_id === mealType.id
            )
          )
        : selectedDepartments.includes(emp.department_id.toString()) &&
          !mealTypes.every((mealType) =>
            submittedEmployees.some(
              (submitted) =>
                submitted.id === emp.id && submitted.meal_id === mealType.id
            )
          )
    );
    setFilteredEmployees(filterEmployees);
  }, [employees, selectedDepartments, submittedEmployees, mealTypes]);

  // Toggle employee selection
  const toggleEmployee = (empId: string) => {
    const selectedEmployee = employees.find(
      (emp) => emp.id.toString() === empId
    );
    if (!selectedEmployee) return;

    setSelectedEmployees((prev) =>
      prev.some((emp) => emp.id === selectedEmployee.id)
        ? prev.filter((emp) => emp.id !== selectedEmployee.id)
        : [...prev, selectedEmployee]
    );
  };

  // Add all employees to the selection
  const addAllEmployees = () => {
    setSelectedEmployees(filteredEmployees);
  };

  // Remove all selected employees
  const removeAllEmployees = () => {
    setSelectedEmployees([]);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Employee List</h2>

      {/* Filter Component */}
      <div className="mb-4">
        <FilterComponent
          items={employees}
          filterBy={(emp, searchTerm) =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.code.toString().includes(searchTerm)
          }
          onFilter={setFilteredEmployees}
          placeholder="Search Employees by Name or Code..."
        />
      </div>

      {/* Selection Actions */}
      <div className="mb-4">
        <SelectionActions
          onAddAll={addAllEmployees}
          onRemoveAll={removeAllEmployees}
          disableAddAll={filteredEmployees.length === selectedEmployees.length}
          disableRemoveAll={selectedEmployees.length === 0}
        />
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        {filteredEmployees.length > 0 ? (
          <ScrollArea.Root className="h-full w-full overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className={`flex items-center justify-between border rounded-lg p-3 my-2  cursor-pointer ${
                    selectedEmployees.some((e) => e.id === emp.id)
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onClick={() => toggleEmployee(emp.id.toString())}
                >
                  <div>
                    <div className={`text-s font-semibold ${rubik.className}`}>
                      {emp.name}
                    </div>
                    <div className="text-xs text-gray-500">{emp.title}</div>
                    <span className="text-xs text-gray-500 font-bold">
                      Code: {emp.code}
                    </span>
                  </div>
                  <Checkbox.Root
                    checked={selectedEmployees.some((e) => e.id === emp.id)}
                    className="w-5 h-5 border rounded flex items-center justify-center"
                    onCheckedChange={() => toggleEmployee(emp.id.toString())}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              ))}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="w-2 bg-gray-200"
            >
              <ScrollArea.Thumb className="bg-gray-400 rounded" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
            <p className="text-sm font-medium">No Employees found</p>
          </div>
        )}
      </div>

      {/* Employee Dialog */}
      <EmployeeSelectionDialog
        selectedEmployees={selectedEmployees}
        mealTypes={mealTypes}
        onSelectMealType={(selectedMealTypes) => {
          console.log("Meal Types Selected:", selectedMealTypes);
        }}
      />
    </div>
  );
}
