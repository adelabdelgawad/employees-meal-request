"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { DepartmentType, EmployeeType, MealType } from "@/pages/definitions";
import {
  getDepartments,
  getEmployees,
  getMealTypes,
} from "@/app/_lib/data-fetcher";

interface RequestContextType {
  departments: DepartmentType[];
  employees: EmployeeType[];
  mealTypes: MealType[];
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEmployees: EmployeeType[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<EmployeeType[]>>;
  submittedEmployees: any[];
  setSubmittedEmployees: React.Dispatch<React.SetStateAction<any[]>>;
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
  const [submittedEmployees, setSubmittedEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedDepartments = await getDepartments();
        setDepartments(fetchedDepartments);

        const fetchedEmployees = await getEmployees();
        setEmployees(fetchedEmployees);

        const fetchedMealTypes = await getMealTypes();
        setMealTypes(fetchedMealTypes);
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
        submittedEmployees,
        setSubmittedEmployees,
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
