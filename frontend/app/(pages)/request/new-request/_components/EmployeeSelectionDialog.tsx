"use client";

import { FC, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Cross2Icon } from "@radix-ui/react-icons";
import { EmployeeType, MealType } from "@/lib/definitions";
import { useRequest } from "@/context/RequestContext";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeNotes, setEmployeeNotes] = useState<Record<number, string>>(
    {}
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
  const { submittedEmployees, setSubmittedEmployees } = useRequest();
  const { addAlert } = useAlerts();

  // Handle note input changes
  const handleNoteChange = (employeeId: number, note: string) => {
    setEmployeeNotes((prev) => ({ ...prev, [employeeId]: note }));
  };

  // Handle meal type selection
  const handleMealTypeChange = (selectedMealTypes: MealType[]) => {
    setSelectedMealTypes(selectedMealTypes);
    onSelectMealType(selectedMealTypes);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedMealTypes.length === 0) {
      addAlert(
        "Please select at least one meal type before submitting.",
        "warning"
      );
      return;
    }

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
    const duplicateEntries = finalData.filter((entry) =>
      submittedEmployees.some(
        (submitted) =>
          submitted.id === entry.id && submitted.meal_id === entry.meal_id
      )
    );

    if (duplicateEntries.length > 0) {
      duplicateEntries.forEach((entry) => {
        addAlert(
          `${entry.name} already has Meal Type "${entry.meal_name}" submitted.`,
          "warning"
        );
      });
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

    // Close dialog after submission
    setIsDialogOpen(false);
  };

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger asChild>
        <button
          className="w-full p-2 mt-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
          disabled={selectedEmployees.length === 0}
        >
          Add Selected Employees
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
        <Dialog.Content className="fixed inset-0 bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto mt-20">
          <Dialog.Title className="text-lg font-semibold">
            Selected Employees
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <Cross2Icon />
            </button>
          </Dialog.Close>

          {/* Selected Employees List */}
          {selectedEmployees.length > 0 ? (
            <ScrollArea.Root className="border rounded-lg mt-4 max-h-[400px]">
              <ScrollArea.Viewport className="p-2">
                <div className="space-y-2">
                  {selectedEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="p-2 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h4 className="text-sm font-semibold">
                          {employee.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Title: {employee.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Code: {employee.code}
                        </p>
                      </div>
                      <input
                        type="text"
                        placeholder="Notes"
                        value={employeeNotes[employee.id] || ""}
                        onChange={(e) =>
                          handleNoteChange(employee.id, e.target.value)
                        }
                        className="ml-4 w-40 p-2 border rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical">
                <ScrollArea.Thumb className="bg-gray-400 rounded" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          ) : (
            <p className="text-center text-gray-500 mt-4">
              No employees selected.
            </p>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            className="w-full p-2 mt-4 bg-blue-600 text-white hover:bg-blue-700"
            disabled={selectedMealTypes.length === 0}
          >
            Confirm
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EmployeesSelectionDialog;
