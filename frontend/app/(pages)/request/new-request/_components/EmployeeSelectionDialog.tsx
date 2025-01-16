'use client';

import { FC, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Input } from '@/components/ui/input';
import MealOption from './MealOption';
import { useNewRequest } from '@/hooks/NewRequestContext';
import { EmployeeType, Meal } from '@/pages/definitions';
import { useAlerts } from '@/components/alert/useAlerts';
import { sub } from 'date-fns';

interface EmployeeSelectionDialogProps {
  selectedEmployees: EmployeeType[];
  setSelectedEmployees: (employees: EmployeeType[]) => void;
  Meals: Meal[];
  onSelectMeal: (selectedMeals: Meal[]) => void;
}

const EmployeesSelectionDialog: FC<EmployeeSelectionDialogProps> = ({
  selectedEmployees,
  setSelectedEmployees,
  Meals,
  onSelectMeal,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeNotes, setEmployeeNotes] = useState<Record<number, string>>(
    {},
  );
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const { submittedEmployees, setSubmittedEmployees } = useNewRequest();
  const { addAlert } = useAlerts();

  // Handle notes input change
  const handleNoteChange = (employeeId: number, note: string) => {
    setEmployeeNotes((prev) => ({
      ...prev,
      [employeeId]: note,
    }));
  };

  // Handle meal type selection
  const handleMealChange = (selectedMeals: Meal[]) => {
    setSelectedMeals(selectedMeals);
    onSelectMeal(selectedMeals);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedMeals.length === 0) {
      addAlert(
        'Please select at least one meal type before submitting.',
        'warning',
      );
      return;
    }

    const finalData = selectedEmployees.flatMap((employee) =>
      selectedMeals.map((Meal) => ({
        id: employee.id,
        code: employee.code,
        name: employee.name,
        department_id: employee.department_id,
        meal_id: Meal.id,
        meal_name: Meal.name,
        notes: employeeNotes[employee.id] || '',
      })),
    );

    // Check for duplicates and generate detailed error messages
    const duplicateEntries = finalData.filter((entry) =>
      submittedEmployees.some(
        (submitted) =>
          submitted.id === entry.id &&
          submitted.meal_id === entry.meal_id &&
          submitted.code === entry.code,
      ),
    );

    if (duplicateEntries.length > 0) {
      // Display detailed error message for each duplicate entry
      duplicateEntries.forEach((entry) => {
        addAlert(
          `${entry.name} already has Meal Type "${entry.meal_name}" submitted.`,
          'warning',
        );
        console.log(entry);
      });
    }

    // Filter out duplicates before adding new entries
    const newEntries = finalData.filter(
      (entry) =>
        !submittedEmployees.some(
          (submitted) =>
            submitted.id === entry.id && submitted.meal_id === entry.meal_id,
        ),
    );

    setSubmittedEmployees([...submittedEmployees, ...newEntries]);

    // Hide the dialog after submission
    setSelectedEmployees([]);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full p-2 mt-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
          disabled={selectedEmployees.length === 0}
        >
          Add Selected Employees
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[75vh] flex flex-col">
        <DialogHeader className="items-center">
          <DialogTitle>Selected Employees</DialogTitle>
        </DialogHeader>

        {/* Meal Type Selection (Always Visible) */}
        <div className="mb-2">
          <MealOption
            Meals={Meals}
            selectedMeals={selectedMeals}
            onSelectMeal={handleMealChange}
          />
        </div>

        {/* Selected Employees List with Dynamic Scroller */}
        <div className="flex-grow overflow-y-auto border-t border-b border-gray-300 my-2">
          {selectedEmployees.length > 0 ? (
            <ScrollArea.Root className="h-full w-full overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full">
                {selectedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:shadow-md"
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
                      value={employeeNotes[employee.id] || ''}
                      onChange={(e) =>
                        handleNoteChange(employee.id, e.target.value)
                      }
                      className="mt-4 sm:mt-0 sm:w-1/2 w-full"
                    />
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
            <p className="text-center text-gray-500">
              No employees selected. Please select employees to proceed.
            </p>
          )}
        </div>

        {/* Confirm Button (Always Visible) */}
        <div className="mt-2">
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            disabled={selectedMeals.length === 0}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeesSelectionDialog;
