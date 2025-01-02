"use client";

import { useEffect, useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeType } from "@/lib/definitions";
import { fetchEmployees } from "@/api/employee";

interface EmployeeProps {
  selectedDepartments: string[];
}

function EmployeeList({
  employees,
  selectedEmployees,
  toggleEmployee,
}: {
  employees: EmployeeType[];
  selectedEmployees: string[];
  toggleEmployee: (empId: string) => void;
}) {
  return employees.length === 0 ? (
    <p className="text-gray-500 text-center">No employees found.</p>
  ) : (
    <div className="space-y-1">
      {employees.map((emp) => (
        <label
          key={emp.id}
          className={`block border rounded-lg p-4 cursor-pointer ${
            selectedEmployees.includes(emp.id.toString())
              ? "bg-blue-50 border-blue-500"
              : "bg-white border-gray-300"
          }`}
          onClick={() => toggleEmployee(emp.id.toString())}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-sm font-semibold">{emp.name}</div>
              <div className="text-xs text-gray-500">{emp.title}</div>
            </div>
            <div className="text-left">
              <span className="text-xs text-gray-500 font-bold">
                {emp.code}
              </span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

export default function Employee({ selectedDepartments }: EmployeeProps) {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeType[]>(
    []
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEmployees(selectedDepartments);
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDepartments]);

  useEffect(() => {
    if (!search) {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.code.toString().includes(search)
        )
      );
    }
  }, [search, employees]);

  const toggleEmployee = (empId: string) => {
    const updated = selectedEmployees.includes(empId)
      ? selectedEmployees.filter((id) => id !== empId)
      : [...selectedEmployees, empId];
    setSelectedEmployees(updated);
  };

  const selectAll = () => {
    const allIds = filteredEmployees.map((emp) => emp.id.toString());
    setSelectedEmployees(allIds);
  };

  const removeAll = () => {
    setSelectedEmployees([]);
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search Employees by Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="flex justify-between mb-4">
            <Button variant="outline" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" onClick={removeAll}>
              Remove All
            </Button>
          </div>

          <ScrollArea
            className="overflow-y-auto border rounded-lg p-2 bg-gray-50"
            style={{
              height: "100%",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <Suspense
              fallback={
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-md" />
                  ))}
                </div>
              }
            >
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-md" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500 text-center">Error: {error}</p>
              ) : (
                <EmployeeList
                  employees={filteredEmployees}
                  selectedEmployees={selectedEmployees}
                  toggleEmployee={toggleEmployee}
                />
              )}
            </Suspense>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
