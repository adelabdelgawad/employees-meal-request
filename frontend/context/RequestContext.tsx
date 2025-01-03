"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchDepartments } from "@/api/department";
import { fetchEmployees } from "@/api/employee";
import { DepartmentType, EmployeeType, MealType } from "@/lib/definitions";

interface RequestContextType {
  departments: DepartmentType[];
  employees: EmployeeType[];
  mealTypes: MealType[];
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEmployees: EmployeeType[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<EmployeeType[]>>;
  loading: boolean;
  error: string | null;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedDepartments = await fetchDepartments();
        setDepartments(fetchedDepartments);

        const fetchedEmployees = await fetchEmployees();
        setEmployees(fetchedEmployees);

        setMealTypes([
          { id: 1, name: "Lunch" },
          { id: 2, name: "Dinner" },
        ]);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <RequestContext.Provider
      value={{
        departments,
        employees,
        mealTypes,
        selectedDepartments,
        setSelectedDepartments,
        selectedEmployees,
        setSelectedEmployees,
        loading,
        error,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequest() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
}
