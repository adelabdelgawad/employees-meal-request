"use client";

import { useState, useEffect, useMemo } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useRequest } from "@/hooks/RequestContext";
import FilterComponent from "../_components/Filter";
import SelectionActions from "../_components/SelectionActions";

export default function DepartmentColumn() {
  const { departments, selectedDepartments, setSelectedDepartments } =
    useRequest();

  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  // Memoize filteredDepartments to avoid recalculation on each render
  const filteredList = useMemo(
    () => filteredDepartments,
    [filteredDepartments]
  );

  // Update filteredDepartments when departments change
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
    setSelectedDepartments(filteredList.map((dept) => dept.id.toString()));
  };

  // Remove all selected departments
  const removeAllDepartments = () => {
    setSelectedDepartments([]);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md p-4">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4">Department List</h2>

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
          disableAddAll={filteredList.length === selectedDepartments.length}
          disableRemoveAll={selectedDepartments.length === 0}
        />
      </div>

      {/* Department List */}
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        {filteredList.length > 0 ? (
          <ScrollArea.Root className="h-full w-full overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              {filteredList.map((dept) => (
                <div
                  key={dept.id}
                  className={`flex items-center justify-between border rounded-lg p-3 my-2  cursor-pointer ${
                    selectedDepartments.includes(dept.id.toString())
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium">{dept.name}</span>
                  <Checkbox.Root
                    checked={selectedDepartments.includes(dept.id.toString())}
                    onCheckedChange={() => toggleDepartment(dept.id.toString())}
                    className="w-5 h-5 border rounded flex items-center justify-center"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </div>
              ))}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="w-2 bg-gray-200"
            >
              <ScrollArea.Thumb className="bg-gray-400 rounded" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
            <p className="text-sm font-medium">No departments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
