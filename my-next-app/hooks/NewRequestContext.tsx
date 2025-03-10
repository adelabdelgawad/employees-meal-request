"use client";

import { createContext, useContext, useEffect, useState } from "react";
import clientAxiosInstance from "@/lib/clientAxiosInstance";

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

  // ✅ Function to reset submitted employees
  const resetSubmittedEmployees = () => {
    setSubmittedEmployees([]);
    setSelectedDepartments([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await clientAxiosInstance.get("/new-request-data");
        setDepartments(response.data.departments);
        setEmployees(response.data.employees);
        setMeals(response.data.meals);
      } catch (error) {
        console.error("Error scheduling request:", error);
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
