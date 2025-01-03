"use client";

import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MealTypeOption from "./MealTypeOption";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequest } from "@/context/RequestContext";
import { EmployeeType, MealType } from "@/lib/definitions";
import { useAlerts } from "@/components/alert/useAlerts";

interface EmployeeSelectionDialogProps {
  selectedEmployees: EmployeeType[];
  mealTypes: MealType[];
  onSelectMealType: (selectedMealTypes: MealType[]) => void;
}

const EmployeesSelectionDialog: FC<EmployeeSelectionDialogProps> = ({
  selectedEmployees,
  mealTypes,
  onSelectMealType,
}) => {
  const [employeeNotes, setEmployeeNotes] = useState<Record<number, string>>(
    {}
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
  const { submittedEmployees, setSubmittedEmployees } = useRequest();
  const { addAlert } = useAlerts();

  // Handle notes input change
  const handleNoteChange = (employeeId: number, note: string) => {
    setEmployeeNotes((prev) => ({
      ...prev,
      [employeeId]: note,
    }));
  };

  // Handle meal type selection
  const handleMealTypeChange = (selectedMealTypes: MealType[]) => {
    setSelectedMealTypes(selectedMealTypes);
    onSelectMealType(selectedMealTypes);
  };

  // Handle form submission
  const handleSubmit = () => {
    const finalData = selectedEmployees.flatMap((employee) =>
      selectedMealTypes.map((mealType) => ({
        id: employee.id,
        name: employee.name,
        department_id: employee.department_id,
        meal_id: mealType.id,
        meal_name: mealType.name,
        notes: employeeNotes[employee.id] || "",
      }))
    );

    // Check for duplicates
    const duplicates = finalData.filter((entry) =>
      submittedEmployees.some(
        (submitted) =>
          submitted.id === entry.id && submitted.meal_id === entry.meal_id
      )
    );

    if (duplicates.length > 0) {
      addAlert("Duplicate records detected!", "warning");
    }

    // Filter out duplicates before adding new entries
    const newEntries = finalData.filter(
      (entry) =>
        !submittedEmployees.some(
          (submitted) =>
            submitted.id === entry.id && submitted.meal_id === entry.meal_id
        )
    );

    setSubmittedEmployees([...submittedEmployees, ...newEntries]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full p-2 mt-2 bg-green-600 text-white hover:bg-green-700">
          Add Selected Employees
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="items-center">
          <DialogTitle>Selected Employees</DialogTitle>
        </DialogHeader>

        {/* Meal Type Selection */}
        <MealTypeOption
          mealTypes={mealTypes}
          onSelectMealType={handleMealTypeChange}
        />

        {/* Selected Employees List with Scroller */}
        {selectedEmployees.length > 0 ? (
          <ScrollArea className="mt-4 border rounded-lg p-2 bg-gray-50 max-h-[400px] scrollbar-custom">
            <div className="space-y-2">
              {selectedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-4 border border-gray-300 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:shadow-md"
                >
                  {/* Employee Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {employee.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Title: {employee.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Code: {employee.code}
                      </p>
                    </div>
                  </div>

                  {/* Notes Input */}
                  <Input
                    type="text"
                    placeholder="Notes"
                    value={employeeNotes[employee.id] || ""}
                    onChange={(e) =>
                      handleNoteChange(employee.id, e.target.value)
                    }
                    className="mt-4 sm:mt-0 sm:w-1/2 w-full"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-gray-500">
            No employees selected. Please select employees to proceed.
          </p>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-600 text-white"
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeesSelectionDialog;
