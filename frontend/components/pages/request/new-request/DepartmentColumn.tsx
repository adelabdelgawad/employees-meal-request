"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequest } from "@/context/RequestContext";
import FilterComponent from "./Filter";
import SelectionActions from "./SelectionActions";

export default function DepartmentColumn() {
  const { departments, selectedDepartments, setSelectedDepartments } =
    useRequest();
  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  // Filter departments
  useEffect(() => {
    setFilteredDepartments(departments);
  }, [departments]);

  // Toggle department selection
  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };

  // Add all departments to the selection
  const addAllDepartments = () => {
    setSelectedDepartments(
      filteredDepartments.map((dept) => dept.id.toString())
    );
  };

  // Remove all selected departments
  const removeAllDepartments = () => {
    setSelectedDepartments([]);
  };

  return (
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="p-4">
          <CardTitle>Department List</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden">
          {/* Filter Component */}
          <div className="mb-4">
            <FilterComponent
              items={departments}
              filterBy={(dept, searchTerm) =>
                dept.name.toLowerCase().includes(searchTerm.toLowerCase())
              }
              onFilter={setFilteredDepartments}
              placeholder="Search Departments..."
            />
          </div>

          {/* Selection Actions */}
          <div className="mb-4">
            <SelectionActions
              onAddAll={addAllDepartments}
              onRemoveAll={removeAllDepartments}
              disableAddAll={
                filteredDepartments.length === selectedDepartments.length
              }
              disableRemoveAll={selectedDepartments.length === 0}
            />
          </div>

          {/* Department List */}
          <ScrollArea className="flex-1 overflow-auto border rounded-lg bg-gray-50">
            <div className="space-y-1">
              {filteredDepartments.length === 0 ? (
                <p className="text-gray-500 text-center">No departments found.</p>
              ) : (
                filteredDepartments.map((dept) => (
                  <label
                    key={dept.id}
                    className={`block border rounded-lg p-4 cursor-pointer ${
                      selectedDepartments.includes(dept.id.toString())
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                    onClick={() => toggleDepartment(dept.id.toString())}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{dept.name}</div>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
  );
}
