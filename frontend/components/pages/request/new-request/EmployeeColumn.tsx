"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequest } from "@/context/RequestContext";
import SelectionActions from "./SelectionActions";
import { EmployeeType } from "@/lib/definitions";

export default function EmployeeColumn() {
  const {
    employees,
    selectedEmployees,
    setSelectedEmployees,
    selectedDepartments,
  } = useRequest();
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeType[]>(
    []
  );
  const [search, setSearch] = useState("");

  // Filter employees based on selected departments
  useEffect(() => {
    if (selectedDepartments.length === 0) {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((emp) =>
          selectedDepartments.includes(emp.department_id.toString())
        )
      );
    }
  }, [employees, selectedDepartments]);

  // Search functionality
  useEffect(() => {
    if (!search) {
      setFilteredEmployees(
        employees.filter(
          (emp) =>
            selectedDepartments.length === 0 ||
            selectedDepartments.includes(emp.department_id.toString())
        )
      );
    } else {
      setFilteredEmployees(
        employees.filter(
          (emp) =>
            (selectedDepartments.length === 0 ||
              selectedDepartments.includes(emp.department_id.toString())) &&
            (emp.name.toLowerCase().includes(search.toLowerCase()) ||
              emp.code.toString().includes(search))
        )
      );
    }
  }, [search, employees, selectedDepartments]);

  // Add all employees to selected
  const selectAll = () => {
    const allIds = filteredEmployees.map((emp) => emp.id.toString());
    setSelectedEmployees(allIds);
  };

  // Remove all selected employees
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
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search Employees by Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Selection Actions */}
          <SelectionActions onAddAll={selectAll} onRemoveAll={removeAll} />

          {/* Employee List */}
          <ScrollArea
            className="overflow-y-auto border rounded-lg p-2 bg-gray-50"
            style={{
              height: "100%",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            {filteredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center">No employees found.</p>
            ) : (
              filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className={`block border rounded-lg p-4 cursor-pointer ${
                    selectedEmployees.includes(emp.id.toString())
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onClick={() =>
                    setSelectedEmployees((prev) =>
                      prev.includes(emp.id.toString())
                        ? prev.filter((id) => id !== emp.id.toString())
                        : [...prev, emp.id.toString()]
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.title}</div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-gray-500 font-bold">
                        Code: {emp.code}
                      </span>
                    </div>
                  </div>
                </label>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
