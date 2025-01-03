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
  } = useRequest();
  const [filteredEmployees, setFilteredEmployees] = useState(employees);

  // Filter employees based on selected departments
  useEffect(() => {
    if (selectedDepartments.length === 0) {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((emp) =>
          selectedDepartments.includes(emp.department_id.toString())
        )
      );
    }
  }, [employees, selectedDepartments]);

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
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Component */}
          <FilterComponent
            items={employees}
            filterBy={(emp, searchTerm) =>
              emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.code.toString().includes(searchTerm)
            }
            onFilter={setFilteredEmployees}
            placeholder="Search Employees by Name or Code..."
          />

          {/* Selection Actions */}
          <SelectionActions
            onAddAll={addAllEmployees}
            onRemoveAll={removeAllEmployees}
            disableAddAll={
              filteredEmployees.length === selectedEmployees.length
            }
            disableRemoveAll={selectedEmployees.length === 0}
          />

          {/* Employee List */}
          <ScrollArea className="overflow-y-auto border rounded-lg p-2 bg-gray-50 h-[calc(100vh-300px)]">
            {filteredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center">No employees found.</p>
            ) : (
              filteredEmployees.map((emp) => (
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
              ))
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
    </div>
  );
}
