"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { DepartmentType, EmployeeType, Meal } from "@/pages/definitions";
import { getDepartments, getEmployees, getMeals } from "@/lib/services/data";

interface NewRequestContextType {
  departments: DepartmentType[];
  employees: EmployeeType[];
  Meals: Meal[];
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEmployees: EmployeeType[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<EmployeeType[]>>;
  submittedEmployees: any[];
  setSubmittedEmployees: React.Dispatch<React.SetStateAction<any[]>>;
  resetSubmittedEmployees: () => void;
  loading: boolean;
  error: string | null;
}

const NewRequestContext = createContext<NewRequestContextType | undefined>(
  undefined
);

export function NewRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [Meals, setMeals] = useState<Meal[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeType[]>(
    []
  );
  const [submittedEmployees, setSubmittedEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Function to reset submitted employees
  const resetSubmittedEmployees = () => {
    setSubmittedEmployees([]);
    setSelectedDepartments([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedDepartments = await getDepartments();
        setDepartments(fetchedDepartments);
        console.log(fetchedDepartments)

        const fetchedEmployees = await getEmployees();
        setEmployees(fetchedEmployees);

        const fetchedMeals = await getMeals();
        setMeals(fetchedMeals);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <NewRequestContext.Provider
      value={{
        departments,
        employees,
        Meals,
        selectedDepartments,
        setSelectedDepartments,
        selectedEmployees,
        setSelectedEmployees,
        submittedEmployees,
        setSubmittedEmployees,
        resetSubmittedEmployees,
        loading,
        error,
      }}
    >
      {children}
    </NewRequestContext.Provider>
  );
}

export function useNewRequest() {
  const context = useContext(NewRequestContext);
  if (!context) {
    throw new Error("useNewRequest must be used within a NewRequestProvider");
  }
  return context;
}
