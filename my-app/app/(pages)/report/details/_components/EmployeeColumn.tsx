'use client';

import { useState, useMemo, useCallback } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { Rubik } from 'next/font/google';

// Custom hooks or contexts
import { useNewRequest } from '@/hooks/NewRequestContext';

// Child components
import FilterComponent from './_components/Filter';
import SelectionActions from './_components/SelectionActions';
import EmployeeSelectionDialog from './_components/EmployeeSelectionDialog';

const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500', '700'] });
/**
 * Represents an individual employee object.
 * Adjust to match your actual data shape.
 */
interface EmployeeType {
  id: number; // using numeric ID
  name: string;
  title: string;
  code: string;
  department_id: number;
}

/**
 * EmployeeColumn
 *
 * Displays a searchable, filterable list of employees based on:
 * - Selected departments
 * - Meal submission status
 * - Search query (by name)
 *
 * Allows selecting/unselecting employees and bulk actions.
 */
export default function EmployeeColumn() {
  const {
    employees, // Array<EmployeeType>
    selectedEmployees, // Array<EmployeeType>
    setSelectedEmployees, // React.Dispatch<React.SetStateAction<EmployeeType[]>>
    Meals, // e.g. Array of meal objects
    selectedDepartments, // string[] of department IDs
    submittedEmployees, // Array<EmployeeType> or similar
  } = useNewRequest();

  // Local search state (lifted up from FilterComponent)
  const [search, setSearch] = useState('');

  /**
   * Filter employees by department & meal submission status.
   * We exclude employees who are "fully submitted" for all Meals,
   * and optionally filter by selectedDepartments if any are chosen.
   */
  const departmentMealFilteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Check if emp is already submitted for *all* Meals
      const isSubmittedForAllMeals = Meals.every((Meal) =>
        submittedEmployees.some(
          (submitted) =>
            submitted.id === emp.id && submitted.meal_id === Meal.id,
        ),
      );
      if (isSubmittedForAllMeals) {
        return false; // exclude already-submitted for all meals
      }

      // If no departments are selected, keep all non-submitted employees
      if (selectedDepartments.length === 0) {
        return true;
      }

      // Otherwise, keep only if emp's dept is in `selectedDepartments`
      return selectedDepartments.includes(emp.department_id.toString());
    });
  }, [employees, Meals, submittedEmployees, selectedDepartments]);

  /**
   * Apply the local search filter on top of the departmentMealFilteredEmployees.
   * Searching by `name` (case-insensitive).
   * Modify if you need to search by code, etc.
   */
  const finalFilteredEmployees = useMemo(() => {
    if (!search.trim()) {
      return departmentMealFilteredEmployees;
    }
    const lowerSearch = search.toLowerCase();
    return departmentMealFilteredEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.code.toString().toLowerCase().includes(lowerSearch), // Convert code to string
    );
  }, [departmentMealFilteredEmployees, search]);

  /**
   * Toggles a single employee in/out of the `selectedEmployees`.
   * Uses numeric `empId` to avoid TS "no overlap" error.
   *
   * @param {number} empId - The numeric ID of the employee to toggle.
   */
  const toggleEmployee = useCallback(
    (empId: number) => {
      setSelectedEmployees((prev) => {
        const exists = prev.some((emp) => emp.id === empId);
        if (exists) {
          // Remove from selected
          return prev.filter((emp) => emp.id !== empId);
        }
        // Add to selected
        const newSelection = finalFilteredEmployees.find(
          (emp) => emp.id === empId,
        );
        return newSelection ? [...prev, newSelection] : prev;
      });
    },
    [setSelectedEmployees, finalFilteredEmployees],
  );

  /**
   * Add all employees (from the final filtered list) to the selectedEmployees.
   */
  const addAllEmployees = useCallback(() => {
    setSelectedEmployees(finalFilteredEmployees);
  }, [setSelectedEmployees, finalFilteredEmployees]);

  /**
   * Clear out selectedEmployees entirely.
   */
  const removeAllEmployees = useCallback(() => {
    setSelectedEmployees([]);
  }, [setSelectedEmployees]);

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Employee List</h2>

      {/* Display how many employees match the final filter */}
      <p className="text-sm text-gray-500 mb-2">
        Showing {finalFilteredEmployees.length} results
      </p>

      {/* Filter Component (just sets `search`) */}
      <div className="mb-4">
        <FilterComponent
          search={search}
          setSearch={setSearch}
          placeholder="Search Employees by Name..."
        />
      </div>

      {/* Bulk Selection Actions */}
      <div className="mb-4">
        <SelectionActions
          onAddAll={addAllEmployees}
          onRemoveAll={removeAllEmployees}
          disableAddAll={
            finalFilteredEmployees.length === selectedEmployees.length
          }
          disableRemoveAll={selectedEmployees.length === 0}
        />
      </div>

      {/* Scrollable Employee List */}
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        {finalFilteredEmployees.length > 0 ? (
          <ScrollArea.Root className="h-full w-full overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              {finalFilteredEmployees.map((emp) => {
                const isSelected = selectedEmployees.some(
                  (sel) => sel.id === emp.id,
                );
                return (
                  <div
                    key={emp.id}
                    className={`flex items-center justify-between border rounded-lg p-3 my-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                    onClick={() => toggleEmployee(emp.id)}
                  >
                    <div>
                      <div
                        className={`text-s font-semibold ${rubik.className}`}
                      >
                        {emp.name}
                      </div>
                      <div className="text-xs text-gray-500">{emp.title}</div>
                      <span className="text-xs text-gray-500 font-bold">
                        Code: {emp.code}
                      </span>
                    </div>
                    <Checkbox.Root
                      checked={isSelected}
                      className="w-5 h-5 border rounded flex items-center justify-center"
                      onCheckedChange={() => toggleEmployee(emp.id)}
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="w-4 h-4 text-blue-500" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </div>
                );
              })}
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

      {/* Employee Dialog (unchanged) */}
      <EmployeeSelectionDialog
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        Meals={Meals}
        onSelectMeal={(selectedMeals) => {
          console.log('Meal Types Selected:', selectedMeals);
        }}
      />
    </div>
  );
}
