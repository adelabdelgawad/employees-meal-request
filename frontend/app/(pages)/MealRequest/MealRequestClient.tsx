"use client";

import { useState } from "react";
import DepartmentListClient from "./DepartmentListClient";
import EmployeeListClient from "./EmployeeListClient";
import SelectedEmployees from "./SelectedEmployees";
import SubmitMealRequestButton from "./SubmitMealRequestButton";
import useAlerts from "@/components/alert/useAlerts";
import AlertStack from "@/components/alert/AlertStack";

interface MealRequestClientProps {
  departmentData: Record<string, any[]>;
}

export default function MealRequestClient({
  departmentData,
}: MealRequestClientProps) {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]); // Single source of truth

  const { alerts, addAlert, removeAlert } = useAlerts();

  // Function to remove an employee from the selected list
  const handleRemoveEmployee = (employeeCode: string, mealType: string) => {
    setSelectedEmployees((prevSelectedEmployees) => {
      const updated = prevSelectedEmployees.filter(
        (employee) =>
          !(
            employee.code === employeeCode &&
            (mealType === "lunch"
              ? employee.mealTypes.lunch
              : employee.mealTypes.dinner)
          )
      );
      // No re-adding logic here; once removed, they will reappear in the select list because they are no longer selected.
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedEmployees.length === 0) {
      addAlert("No employees selected to submit the meal request.", "warning");
      return;
    }

    // Process submission logic here (e.g., send data to backend)
    console.log("Submitted Meal Request:", selectedEmployees);

    // Show success alert
    addAlert("Meal Request Submitted Successfully!", "success");

    // Optionally, reload the page to reset the form
    window.location.reload();
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center p-0 m-0 text-gray-800 ">
      {/* AlertStack Component */}
      <AlertStack alerts={alerts} onRemove={removeAlert} />

      {/* Main Content */}
      <div
        className="flex flex-1 flex-col bg-white shadow-lg rounded-lg mt-1 p-4 overflow-auto"
        style={{
          width: "85%",
          maxHeight: "calc(100vh - 140px)", // Adjust for navbar (40px) and footer (80px)
        }}
      >
        <div className="flex flex-row flex-1 w-full space-x-4 overflow-hidden">
          {/* Departments */}
          <div className="flex flex-col flex-1">
            <DepartmentListClient
              departments={Object.keys(departmentData)}
              onDepartmentChange={setSelectedDepartments}
            />
          </div>

          {/* Employees */}
          <div className="flex flex-col flex-1">
            <EmployeeListClient
              departmentData={departmentData}
              selectedDepartments={selectedDepartments}
              selectedEmployees={selectedEmployees}
              onEmployeeSelectionChange={setSelectedEmployees}
              addAlert={addAlert} // Pass addAlert to EmployeeListClient
            />
          </div>

          {/* Selected Employees */}
          <div className="flex flex-col flex-1">
            <SelectedEmployees
              selectedEmployees={selectedEmployees}
              onRemoveEmployee={handleRemoveEmployee}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div
        className="flex bg-white shadow-lg rounded-lg mt-1 p-2 w-full"
        style={{ width: "85%", height: "80px" }}
      >
        <SubmitMealRequestButton
          selectedEmployees={selectedEmployees}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
