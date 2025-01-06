"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequest } from "@/context/RequestContext";
import EmployeeSelectionDialog from "./EmployeeSelectionDialog";
import FilterComponent from "./Filter";
import SelectionActions from "./SelectionActions";

export default function EmployeeColumn() {
  const {
    employees,
    selectedEmployees,
    setSelectedEmployees,
    mealTypes,
    selectedDepartments,
    submittedEmployees,
  } = useRequest();

  // Filter employees based on selected departments
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
      <Card className="flex flex-col w-full h-full">
        <CardHeader className="p-4">
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-4 overflow-hidden">
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
              disableAddAll={
                filteredEmployees.length === selectedEmployees.length
              }
              disableRemoveAll={selectedEmployees.length === 0}
            />
          </div>

          {/* Employee List */}
          <ScrollArea className="flex-1 overflow-auto border rounded-lg bg-gray-50">
            {filteredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center">No employees found.</p>
            ) : (
              <div className="space-y-1">
                {filteredEmployees.map((emp) => (
                  <label
                    key={emp.id}
                    className={`block border rounded-lg p-4 cursor-pointer ${
                      selectedEmployees.some((e) => e.id === emp.id)
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onClick={() => toggleEmployee(emp.id.toString())}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.title}</div>
                      </div>
                      <div className="text-left">
                        <span className="text-xs text-gray-500 font-bold">
                          Code: {emp.code}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Employee Dialog */}
          <EmployeeSelectionDialog
            selectedEmployees={selectedEmployees}
            mealTypes={mealTypes}
            onSelectMealType={(selectedMealTypes) => {
              console.log("Meal Types Selected:", selectedMealTypes);
            }}
          />
        </CardContent>
      </Card>
  );
}
