'use client';
import { FixedSizeList as List } from 'react-window';
import { FC, useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Input } from '@/components/ui/input';
import MealOption from './MealOption';
import { useNewRequest } from '@/hooks/NewRequestContext';
import { EmployeeType, Meal } from '@/pages/definitions';
import { useAlerts } from '@/components/alert/useAlerts';
import { Button } from '@/components/ui/button';
import { Rubik } from 'next/font/google';
import { Cross2Icon } from '@radix-ui/react-icons';

const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500', '700'] });
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [employeeNotes, setEmployeeNotes] = useState<Record<number, string>>(
    {},
  );
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const { submittedEmployees, setSubmittedEmployees } = useNewRequest();
  const { addAlert } = useAlerts();

  const handleNoteChange = (employeeId: number, note: string) => {
    setEmployeeNotes((prev) => ({
      ...prev,
      [employeeId]: note,
    }));
  };

  const handleMealChange = (selectedMeals: Meal[]) => {
    setSelectedMeals(selectedMeals);
    onSelectMeal(selectedMeals);
  };

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

    const duplicateEntries = finalData.filter((entry) =>
      submittedEmployees.some(
        (submitted) =>
          submitted.id === entry.id &&
          submitted.meal_id === entry.meal_id &&
          submitted.code === entry.code,
      ),
    );

    if (duplicateEntries.length > 0) {
      duplicateEntries.forEach((entry) => {
        addAlert(
          `${entry.name} already has Meal Type "${entry.meal_name}" submitted.`,
          'warning',
        );
      });
      return;
    }

    const newEntries = finalData.filter(
      (entry) =>
        !submittedEmployees.some(
          (submitted) =>
            submitted.id === entry.id && submitted.meal_id === entry.meal_id,
        ),
    );

    setSubmittedEmployees([...submittedEmployees, ...newEntries]);
    setSelectedEmployees([]);
    setIsDrawerOpen(false);
  };

  return (
    <div>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsDrawerOpen(true)}
        className="w-full p-2 mt-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
        disabled={selectedEmployees.length === 0}
      >
        Add Selected Employees
      </Button>

      {/* Right-Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-500 ease-in-out w-[30rem] z-50`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Selected Employees</h3>
          <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>
            <Cross2Icon className="w-5 h-5" />{' '}
          </Button>
        </div>

        <div className="p-4">
          {/* Meal Type Selection */}
          <div className="mb-2">
            <MealOption
              Meals={Meals}
              selectedMeals={selectedMeals}
              onSelectMeal={handleMealChange}
            />
          </div>

          {/* Selected Employees List */}
          <div className="flex-grow overflow-y-auto border-t border-b border-gray-300 my-2">
            {selectedEmployees.length > 0 ? (
              <ScrollArea.Root className="h-[75vh] w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                <List
                  height={Math.floor(window.innerHeight * 0.75)} // Set height to 75% of viewport
                  width="100%" // Full width
                  itemCount={selectedEmployees.length} // Number of items
                  itemSize={100} // Height of each item (adjust as needed)
                >
                  {({
                    index,
                    style,
                  }: {
                    index: number;
                    style: React.CSSProperties;
                  }) => {
                    const emp = selectedEmployees[index];
                    return (
                      <div
                        key={emp.id}
                        style={style} // Apply styles for virtualization
                        className="p-2 m-1 border-b border-gray-300 sm:flex-row sm:items-center bg-white"
                      >
                        {/* Employee Info */}
                        <div className="flex flex-col space-y-2">
                          {/* Line 1: Employee Name */}
                          <div
                            className={`text-s font-semibold ${rubik.className}`}
                          >
                            {emp.name}
                          </div>

                          {/* Line 2: Title and Code on Left, Notes on Right */}
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-gray-500">
                                {emp.title}
                              </div>
                              <span className="text-xs text-gray-500 font-bold">
                                Code: {emp.code}
                              </span>
                            </div>
                            <Input
                              type="text"
                              placeholder="Notes"
                              value={employeeNotes[emp.id] || ''}
                              onChange={(e) =>
                                handleNoteChange(emp.id, e.target.value)
                              }
                              className="sm:w-1/2 w-full"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </List>
              </ScrollArea.Root>
            ) : (
              <p className="text-center text-gray-500">
                No employees selected. Please select employees to proceed.
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <div className="mt-2">
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
              disabled={selectedMeals.length === 0}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesSelectionDialog;
