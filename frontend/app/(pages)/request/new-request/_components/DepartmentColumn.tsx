"use client";

import { useState, useEffect, useMemo } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useRequest } from "@/context/RequestContext";
import FilterComponent from "./Filter";
import SelectionActions from "./SelectionActions";

export default function DepartmentColumn() {
  const { departments, selectedDepartments, setSelectedDepartments } =
    useRequest();

  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  // Memoize filteredDepartments to avoid recalculation on each render
  const filteredList = useMemo(
    () => filteredDepartments,
    [filteredDepartments]
  );

  // Filter departments
  useEffect(() => {
    if (filteredDepartments !== departments) {
      setFilteredDepartments(departments);
    }
  }, [departments]);

  // Toggle department selection
  const toggleDepartment = (deptId: string | number) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };

  // Add all departments to the selection
  const addAllDepartments = () => {
    setSelectedDepartments(filteredList.map((dept) => dept.id));
  };

  // Remove all selected departments
  const removeAllDepartments = () => {
    setSelectedDepartments([]);
  };

  return (
    <div className="border rounded-lg shadow-md p-4">
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
      <ScrollArea.Root className="border rounded-lg max-h-[300px] overflow-hidden">
        <ScrollArea.Viewport className="p-2">
          {filteredList.length === 0 ? (
            <p className="text-gray-500 text-center">No departments found.</p>
          ) : (
            filteredList.map((dept) => (
              <div
                key={dept.id}
                className={`border rounded-lg p-3 flex items-center justify-between ${
                  selectedDepartments.includes(dept.id)
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <span className="text-sm font-medium">{dept.name}</span>
                <Checkbox.Root
                  checked={selectedDepartments.includes(dept.id)}
                  onCheckedChange={() => toggleDepartment(dept.id)}
                  className="w-5 h-5 border rounded flex items-center justify-center"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="w-4 h-4 text-blue-500" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </div>
            ))
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="bg-gray-200">
          <ScrollArea.Thumb className="bg-gray-400 rounded" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
