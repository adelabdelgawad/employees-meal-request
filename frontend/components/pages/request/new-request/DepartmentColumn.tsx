"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequest } from "@/context/RequestContext";
import Filter from "./Filter";
import SelectionActions from "./SelectionActions";

export default function DepartmentColumn() {
  const { departments, selectedDepartments, setSelectedDepartments } =
    useRequest();
  const [filteredDepartments, setFilteredDepartments] = useState(departments);

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
    const allIds = filteredDepartments.map((dept) => dept.id.toString());
    setSelectedDepartments(allIds);
  };

  // Remove all selected departments
  const removeAllDepartments = () => {
    setSelectedDepartments([]);
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Department List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Component */}
          <Filter
            items={departments}
            filterBy={(dept, searchTerm) =>
              dept.name.toLowerCase().includes(searchTerm.toLowerCase())
            }
            onFilter={setFilteredDepartments}
            placeholder="Search Departments..."
          />

          {/* Selection Actions */}
          <SelectionActions
            onAddAll={addAllDepartments}
            onRemoveAll={removeAllDepartments}
            disableAddAll={
              filteredDepartments.length === selectedDepartments.length
            }
            disableRemoveAll={selectedDepartments.length === 0}
          />

          {/* Department List */}
          <ScrollArea className="overflow-y-auto border rounded-lg p-2 bg-gray-50 h-[calc(100vh-300px)]">
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
                  <span className="text-sm text-gray-700">{dept.name}</span>
                </label>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
