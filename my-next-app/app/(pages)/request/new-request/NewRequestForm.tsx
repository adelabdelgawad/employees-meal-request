"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle, UserPlus } from "lucide-react";
import NewRequestFormFooter from "./NewRequestFormFooter";

// Assuming these types are defined elsewhere:
// type Employee = { id: number; code: number; name: string; title: string; is_active: string; department_id: string; };
// type NewRequestDataResponse = { departments: { department: string; employees: Employee[] }[]; meals?: any[] };

interface NewRequestFormProps {
  formData: NewRequestDataResponse;
}

function NewRequestForm({ formData }: NewRequestFormProps) {
  // State for department selections (via checkboxes).
  // When empty, employees from all departments are shown.
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  // State for employees that have been added (selected).
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  // State for department search term.
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  // State for employee search term.
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Combine all employees from all departments and attach department name to each employee.
  const allEmployees = formData.departments.flatMap((dept) =>
    dept.employees.map((emp) => ({ ...emp, department: dept.department }))
  );

  // Filter employees based on selected departments and employee search term.
  // If no departments are selected, show all employees.
  // Also, exclude any employees already added to the selected list.
  const filteredEmployees = useMemo(() => {
    let employees =
      selectedDepartments.length > 0
        ? allEmployees.filter((emp) =>
            selectedDepartments.includes(emp.department)
          )
        : allEmployees;
    // Filter by employee search term (search by name or code)
    if (employeeSearchTerm.trim() !== "") {
      const term = employeeSearchTerm.toLowerCase();
      employees = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          String(emp.code).toLowerCase().includes(term)
      );
    }
    return employees.filter(
      (emp) => !selectedEmployees.some((se) => se.id === emp.id)
    );
  }, [selectedDepartments, selectedEmployees, allEmployees, employeeSearchTerm]);

  // Extract the list of unique department names, filtered by search term.
  const departments = Array.from(
    new Set(formData.departments.map((dept) => dept.department))
  ).filter((dept) =>
    dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  // Toggle a department checkbox.
  const handleDepartmentCheckboxChange = (dept: string) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(dept)) {
        // Remove the department if already selected.
        return prev.filter((d) => d !== dept);
      } else {
        // Add the department to selections.
        return [...prev, dept];
      }
    });
  };

  // Add a single employee to the selected list.
  const addEmployee = (employee: Employee) => {
    setSelectedEmployees((prev) => [...prev, employee]);
  };

  // Add all employees currently visible (i.e. filteredEmployees).
  const addAllEmployees = () => {
    setSelectedEmployees((prev) => {
      const newEmployees = filteredEmployees.filter(
        (emp) => !prev.some((se) => se.id === emp.id)
      );
      return [...prev, ...newEmployees];
    });
  };

  // Remove a single employee from the selected list.
  const removeEmployee = (employee: Employee) => {
    setSelectedEmployees((prev) =>
      prev.filter((emp) => emp.id !== employee.id)
    );
  };

  // Department-specific actions:

  // Select all departments by setting the selectedDepartments state
  // to include all available department names.
  const selectAllDepartments = () => {
    const allDeptNames = formData.departments.map((dept) => dept.department);
    setSelectedDepartments(allDeptNames);
  };

  // Clear all department selections.
  const clearAllDepartments = () => {
    setSelectedDepartments([]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Row: occupies ~80% of the screen height */}
      <div className="flex-[40]">
        {/* Grid with three columns: Departments, Employees, Selected Employees */}
        <div className="grid grid-cols-3 gap-5 h-full min-h-0">
          {/* Departments Column */}
          <div className="border rounded p-4 flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Departments</h2>
            <Input
              placeholder="Search Departments..."
              className="mb-2"
              value={departmentSearchTerm}
              onChange={(e) => setDepartmentSearchTerm(e.target.value)}
            />
            <div className="flex justify-between mb-4">
              <Button
                variant="outline"
                className="text-sm"
                onClick={selectAllDepartments}
              >
                <PlusCircle className="h-5 w-5" />
                Select All
              </Button>
              <Button
                variant="destructive"
                className="text-sm"
                onClick={clearAllDepartments}
              >
                <MinusCircle className="h-5 w-5" />
                Clear All
              </Button>
            </div>
            <div
              className="flex-1 border rounded overflow-y-auto p-2"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {departments.length ? (
                departments.map((dept) => (
                  <div
                    key={dept}
                    className="flex items-center mb-2 font-semibold text-xl"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept)}
                      onChange={() => handleDepartmentCheckboxChange(dept)}
                      className="mr-2"
                    />
                    <span>{dept}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No departments found
                </div>
              )}
            </div>
          </div>

          {/* Employees Column */}
          <div className="border rounded p-4 flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Employees</h2>
            <Input
              placeholder="Search Employees..."
              className="mb-2"
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
            />
            <div className="flex justify-between mb-2">
              <Button
                variant="outline"
                className="text-sm"
                onClick={addAllEmployees}
              >
                <PlusCircle className="h-5 w-5" />
                Add All
              </Button>
            </div>
            <div
              className="flex-1 border rounded overflow-y-auto p-1"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {filteredEmployees.length ? (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex justify-between items-center border p-2 mb-2 rounded-xl"
                  >
                    <div>
                      <span className="text-xs text-gray-500 font-bold">
                        Code: {emp.code}
                      </span>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-sm text-gray-600">{emp.title}</div>
                    </div>
                    <Button variant="default" onClick={() => addEmployee(emp)}>
                      <UserPlus className="h-5 w-5 mr-1" />
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No employees available
                </div>
              )}
            </div>
          </div>

          {/* Selected Employees Column */}
          <div className="border rounded p-4 flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Selected Employees</h2>
            <Input
              placeholder="Search Selected Employees..."
              className="mb-2"
            />
            <div className="flex justify-between mb-2">
              <Button
                variant="destructive"
                className="text-sm"
                onClick={() => setSelectedEmployees([])}
              >
                <MinusCircle className="h-5 w-5" />
                Remove All
              </Button>
            </div>
            <div
              className="flex-1 border rounded overflow-y-auto p-1"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {selectedEmployees.length ? (
                selectedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex justify-between items-center border p-2 mb-2 rounded-xl"
                  >
                    <div>
                      <span className="text-xs text-gray-500 font-bold">
                        Code: {emp.code}
                      </span>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-sm text-gray-600">{emp.title}</div>
                    </div>
                    <Button variant="default" onClick={() => removeEmployee(emp)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No employees selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Row: occupies ~20% of screen height */}
      <NewRequestFormFooter meals={formData.meals || []} />
    </div>
  );
}

export default NewRequestForm;
