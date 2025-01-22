'use client';

import { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { Rubik } from 'next/font/google';

// Custom hooks or contexts
import { useNewRequest } from '@/hooks/NewRequestContext';
import FilterComponent from './_components/Filter';
import SelectionActions from './_components/SelectionActions';
import EmployeesSelectionDialog from './_components/EmployeeSelectionDialog';

// Child components

// Font setup
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500', '700'] });

// Types
type EmployeeType = {
  id: number;
  name: string;
  title: string;
  code: string | number;
  department_id: number;
};

type MealType = {
  id: number;
  name: string;
};

export default function EmployeeColumn() {
  const {
    employees, // Array<EmployeeType>
    selectedEmployees, // Array<EmployeeType>
    setSelectedEmployees, // React.Dispatch<React.SetStateAction<EmployeeType[]>>
    Meals, // Array<MealType>
    selectedDepartments, // string[] of department IDs
    submittedEmployees, // Array<EmployeeType> or similar
  } = useNewRequest();

  // Local search state
  const [search, setSearch] = useState('');

  // Filter employees by department & meal submission status
  const departmentMealFilteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Check if emp is already submitted for *all* Meals
      const isSubmittedForAllMeals = Meals.every((Meal) =>
        submittedEmployees.some(
          (submitted) =>
            submitted.id === emp.id && submitted.meal_id === Meal.id,
        ),
      );
      if (isSubmittedForAllMeals) return false; // Exclude already-submitted

      // If no departments are selected, keep all non-submitted employees
      if (selectedDepartments.length === 0) return true;

      // Otherwise, keep only if emp's dept is in `selectedDepartments`
      return selectedDepartments.includes(emp.department_id.toString());
    });
  }, [employees, Meals, submittedEmployees, selectedDepartments]);

  // Filter employees by search term
  const finalFilteredEmployees = useMemo(() => {
    if (!search.trim()) return departmentMealFilteredEmployees;

    const lowerSearch = search.toLowerCase();
    return departmentMealFilteredEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.code.toString().toLowerCase().includes(lowerSearch),
    );
  }, [departmentMealFilteredEmployees, search]);

  // Toggle employee selection
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

  // Add all employees
  const addAllEmployees = useCallback(() => {
    setSelectedEmployees(finalFilteredEmployees);
  }, [setSelectedEmployees, finalFilteredEmployees]);

  // Clear selectedEmployees
  const removeAllEmployees = useCallback(() => {
    setSelectedEmployees([]);
  }, [setSelectedEmployees]);

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Employee List</h2>

      {/* Display number of matching results */}
      <p className="text-sm text-gray-500 mb-2">
        Showing {finalFilteredEmployees.length} results
      </p>

      {/* Filter Component */}
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
      <div className="flex-1 overflow-hidden">
        {finalFilteredEmployees.length > 0 ? (
          <List
            height={Math.floor(window.innerHeight * 0.75)} // 75% of viewport height            width="100%" // Adjust width
            itemCount={finalFilteredEmployees.length}
            itemSize={80} // Adjust item height based on design
          >
            {({
              index,
              style,
            }: {
              index: number;
              style: React.CSSProperties;
            }) => {
              const emp = finalFilteredEmployees[index];
              const isSelected = selectedEmployees.some(
                (sel) => sel.id === emp.id,
              );

              return (
                <div
                  key={emp.id}
                  style={style} // Virtualized styles
                  className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onClick={() => toggleEmployee(emp.id)}
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
            }}
          </List>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
            <p className="text-sm font-medium">No Employees found</p>
          </div>
        )}
      </div>

      {/* Employee Dialog */}
      <EmployeesSelectionDialog
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
``;
