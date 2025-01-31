"use client";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Rubik } from "next/font/google";
import { CheckIcon } from "lucide-react";

// Custom hooks or contexts
import { useNewRequest } from "@/hooks/NewRequestContext";
import FilterComponent from "./_components/Filter";
import SelectionActions from "./_components/SelectionActions";
import EmployeesSelectionDialog from "./_components/EmployeeSelectionDialog";

// Font setup
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function EmployeeColumn() {
  const {
    employees,
    selectedEmployees,
    setSelectedEmployees,
    Meals,
    selectedDepartments,
    submittedEmployees,
  } = useNewRequest();

  const [search, setSearch] = useState("");
  const listRef = useRef(null);

  const departmentMealFilteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const isSubmittedForAllMeals = Meals.every((Meal) =>
        submittedEmployees.some(
          (submitted) =>
            submitted.id === emp.id && submitted.meal_id === Meal.id
        )
      );
      if (isSubmittedForAllMeals) return false;

      if (selectedDepartments.length === 0) return true;

      return selectedDepartments.includes(emp.department_id.toString());
    });
  }, [employees, Meals, submittedEmployees, selectedDepartments]);

  const finalFilteredEmployees = useMemo(() => {
    if (!search.trim()) return departmentMealFilteredEmployees;

    const lowerSearch = search.toLowerCase();
    return departmentMealFilteredEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.code.toString().toLowerCase().includes(lowerSearch)
    );
  }, [departmentMealFilteredEmployees, search]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [finalFilteredEmployees]);

  const toggleEmployee = useCallback(
    (empId) => {
      setSelectedEmployees((prev) => {
        const exists = prev.some((emp) => emp.id === empId);
        if (exists) {
          return prev.filter((emp) => emp.id !== empId);
        }
        const newSelection = finalFilteredEmployees.find(
          (emp) => emp.id === empId
        );
        return newSelection ? [...prev, newSelection] : prev;
      });
    },
    [setSelectedEmployees, finalFilteredEmployees]
  );

  const addAllEmployees = useCallback(() => {
    setSelectedEmployees(finalFilteredEmployees);
  }, [setSelectedEmployees, finalFilteredEmployees]);

  const removeAllEmployees = useCallback(() => {
    setSelectedEmployees([]);
  }, [setSelectedEmployees]);

  return (
    <div className="flex flex-col h-full ">
      <div className="mb-4">
        <FilterComponent
          search={search}
          setSearch={setSearch}
          placeholder="Search Employees..."
        />
      </div>

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

      <div className="flex-1 overflow-hidden">
        {finalFilteredEmployees.length > 0 ? (
          <List
            ref={listRef}
            itemKey={(index) => finalFilteredEmployees[index]?.id ?? index}
            height={Math.floor(window.innerHeight * 0.75)}
            width="100%"
            itemCount={finalFilteredEmployees.length}
            itemSize={80}
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
                (sel) => sel.id === emp.id
              );

              return (
                <div
                  key={emp.id}
                  style={style || {}}
                  className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onClick={() => toggleEmployee(emp.id)}
                >
                  <div>
                    <div className={`text-sm font-semibold ${rubik.className}`}>
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
                    onClick={(e) => e.stopPropagation()}
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

      <EmployeesSelectionDialog
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        Meals={Meals}
        onSelectMeal={(selectedMeals) => {
          console.log("Meal Types Selected:", selectedMeals);
        }}
      />
    </div>
  );
}
