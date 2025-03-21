"use client";

import { useState } from "react";
import { Search, Users, UserPlus,  ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmployeeSelectorProps {
  departments: DepartmentWithEmployees[];
  employees: Employee[];
  selectedDepartmentIds: string[];
  selectedEmployees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onAddAllEmployees: () => void;
}

export function EmployeeSelector({
  departments,
  employees,
  selectedDepartmentIds,
  selectedEmployees,
  onAddEmployee,
  onAddAllEmployees,
}: EmployeeSelectorProps) {
  const [employeeFilter, setEmployeeFilter] = useState("");

  // Get employees for the selected departments
  const departmentEmployees = employees.filter(
    (emp) =>
      selectedDepartmentIds.length === 0 ||
      selectedDepartmentIds.includes(emp.department_id)
  );

  // Filter employees based on search (name or code)
  const filteredEmployees = departmentEmployees.filter(
    (emp) =>
      employeeFilter === "" ||
      emp.name.toLowerCase().includes(employeeFilter.toLowerCase()) ||
      emp.code.toString().includes(employeeFilter)
  );

  // Check if an employee is already selected
  const isEmployeeSelected = (id: number) => {
    return selectedEmployees.some((emp) => emp.id === id);
  };

  // Find department name by department_id
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((dept) =>
      dept.employees.some((emp) => emp.department_id === departmentId)
    );
    return department?.department || "Unknown Department";
  };

  return (
    <Card className="border shadow-sm w-full md:w-1/3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Employees</CardTitle>
          </div>
          <Badge variant="outline">{filteredEmployees.length}</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            className="pl-8"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddAllEmployees}
            disabled={
              filteredEmployees.length === 0 ||
              filteredEmployees.every((emp) => isEmployeeSelected(emp.id))
            }
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-160px)]">
        <ScrollArea className="h-full p-4">
          <div className="space-y-1">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    isEmployeeSelected(emp.id)
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {emp.code}
                      </Badge>
                      <p className="font-medium">{emp.name}</p>
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-muted-foreground">
                        {getDepartmentName(emp.department_id)} • {emp.title}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onAddEmployee(emp)}
                    disabled={isEmployeeSelected(emp.id)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mb-2 opacity-20" />
                <p>No employees found</p>
                <p className="text-sm">
                  Try adjusting your search or select departments
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
